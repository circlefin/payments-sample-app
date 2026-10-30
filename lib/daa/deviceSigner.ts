const AUDIENCE = 'circle-digital-asset-accounts'
const DEVICE_AUTHORIZATION_TYPE = 'aw-device-authorization+jws'
const VALIDITY_SECONDS = 300

export interface DeviceKey {
  pem: string
  authKeyId: string
}

export interface SignedRequest {
  body: string
  deviceAuthorization: string
}

let deviceKey: DeviceKey | null = null
let cryptoKey: CryptoKey | null = null

const encoder = new TextEncoder()

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binary = ''
  view.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function pemToDer(pem: string): Uint8Array<ArrayBuffer> {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '')
  const binary = atob(base64)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

/**
 * Loads the registered device AuthKey from a tee.py device.json. The key is
 * held in memory only and is gone on page reload.
 */
export async function loadDeviceKey(deviceJson: string): Promise<DeviceKey> {
  const parsed = JSON.parse(deviceJson)
  if (!parsed.pem || !parsed.authKeyId) {
    throw new Error('device.json must contain pem and authKeyId')
  }
  cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(parsed.pem),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  )
  deviceKey = { pem: parsed.pem, authKeyId: parsed.authKeyId }
  return deviceKey
}

export function clearDeviceKey() {
  deviceKey = null
  cryptoKey = null
}

export function getDeviceKeyId(): string | null {
  return deviceKey ? deviceKey.authKeyId : null
}

export function hasDeviceKey(): boolean {
  return deviceKey !== null && cryptoKey !== null
}

/**
 * Serializes the body once and signs an Owner-authorization JWS over exactly
 * those bytes. The caller must send {@link SignedRequest.body} unmodified.
 */
export async function signOwnerRequest(
  method: string,
  canonicalPath: string,
  discriminator: string,
  bodyObject: { idempotencyKey?: string },
): Promise<SignedRequest> {
  if (!deviceKey || !cryptoKey) {
    throw new Error('No device key loaded')
  }
  const body = JSON.stringify(bodyObject)
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(body))
  const now = Math.floor(Date.now() / 1000)
  const header = {
    alg: 'ES256',
    kid: deviceKey.authKeyId,
    typ: DEVICE_AUTHORIZATION_TYPE,
  }
  const claims: Record<string, unknown> = {
    body_sha256: base64url(digest),
    canonical_path: canonicalPath,
    method,
    aud: AUDIENCE,
    discriminator,
    schema_version: 1,
    jti: crypto.randomUUID(),
    iat: now,
    exp: now + VALIDITY_SECONDS,
  }
  if (bodyObject.idempotencyKey) {
    claims.idempotency_key = bodyObject.idempotencyKey
  }
  const signingInput = `${base64url(encoder.encode(JSON.stringify(header)))}.${base64url(
    encoder.encode(JSON.stringify(claims)),
  )}`
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    encoder.encode(signingInput),
  )
  return {
    body,
    deviceAuthorization: `${signingInput}.${base64url(signature)}`,
  }
}
