import { uuidFromSeed } from './circle'
import { bridgeIsLive } from './bankRules'
import { cleanCredential } from './clean'

/**
 * Server-side client for Bridge (bridge.xyz): identity checks and virtual bank
 * accounts. The API key comes from an environment variable and never reaches
 * the browser.
 */

function bridgeSettings() {
  const config = useRuntimeConfig()
  const apiKey = cleanCredential(config.bridgeApiKey)

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Bank accounts are not set up on the server yet',
    })
  }

  // Safety guard, like the Circle one: live Bridge keys move real money, so
  // they work only when ALLOW_LIVE_BANKING=true is set on purpose.
  const live = bridgeIsLive(apiKey)
  if (live && config.allowLiveBanking !== 'true') {
    throw createError({
      statusCode: 503,
      statusMessage: 'Only Bridge sandbox keys are allowed. Live keys are disabled',
    })
  }

  const override = String(config.bridgeBaseUrl || '').trim()
  return {
    apiKey,
    live,
    baseUrl:
      override ||
      (live ? 'https://api.bridge.xyz/v0' : 'https://api.sandbox.bridge.xyz/v0'),
  }
}

export function bridgeMode(): { configured: boolean; live: boolean } {
  const config = useRuntimeConfig()
  const apiKey = cleanCredential(config.bridgeApiKey)
  return { configured: apiKey.length > 0, live: apiKey.length > 0 && bridgeIsLive(apiKey) }
}

export function requireSandbox(): void {
  if (bridgeSettings().live) {
    throw createError({
      statusCode: 403,
      statusMessage: 'This test tool works only with a Bridge sandbox key',
    })
  }
}

function bridgeErrorMessage(err: any): string {
  const message = err?.data?.message || err?.statusMessage || err?.message
  return typeof message === 'string' && message ? message : 'Bridge request failed'
}

export async function bridgeRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT'
    body?: Record<string, unknown>
    idempotencyKey?: string
  } = {},
): Promise<T> {
  const settings = bridgeSettings()
  const method = options.method || 'GET'
  const headers: Record<string, string> = {
    'Api-Key': settings.apiKey,
    'Content-Type': 'application/json',
  }
  if (method === 'POST') {
    headers['Idempotency-Key'] = options.idempotencyKey || uuidFromSeed(path + Date.now())
  }
  try {
    return await $fetch<any>(`${settings.baseUrl}${path}`, {
      method,
      headers,
      body: options.body,
    })
  } catch (err: any) {
    console.error('Bridge request failed', path, err?.statusCode, err?.data)
    throw createError({
      statusCode: err?.statusCode && err.statusCode < 500 ? 400 : 502,
      statusMessage: bridgeErrorMessage(err),
    })
  }
}

export interface KycLink {
  id: string
  kyc_link?: string
  tos_link?: string
  kyc_status?: string
  tos_status?: string
  customer_id?: string
  rejection_reasons?: unknown
}

export function bridgeLinkSeed(userId: string): string {
  return `mondo-kyc-${userId}`
}
