import { constants, createHash, publicEncrypt, randomUUID } from 'node:crypto'
import {
  getSetting,
  getWalletRow,
  saveSetting,
  saveWalletRow,
  type WalletRow,
} from './db'

/**
 * Server-side client for Circle Developer-Controlled Wallets.
 * The API key and entity secret come from environment variables and never
 * reach the browser.
 */

export interface TokenBalance {
  amount: string
  token: {
    id: string
    symbol?: string
    blockchain?: string
    isNative?: boolean
    tokenAddress?: string
  }
}

export interface CircleTransaction {
  id: string
  state: string
  amounts?: string[]
  destinationAddress?: string
  sourceAddress?: string
  transactionType?: string
  createDate?: string
  txHash?: string
  blockchain?: string
}

interface CircleWallet {
  id: string
  address: string
  blockchain: string
}

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/
const USDC_DECIMALS = 6

let cachedPublicKey = ''

function circleSettings() {
  const config = useRuntimeConfig()
  const apiKey = String(config.circleApiKey || '')
  const entitySecret = String(config.circleEntitySecret || '')

  if (!apiKey || !entitySecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Wallets are not configured on the server yet',
    })
  }

  // Safety guard: only Circle test keys are accepted unless live mode is
  // switched on deliberately with ALLOW_LIVE_FUNDS=true.
  if (!apiKey.startsWith('TEST_API_KEY:') && config.allowLiveFunds !== 'true') {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Only Circle test API keys are allowed. Live keys are disabled',
    })
  }

  if (!/^[0-9a-fA-F]{64}$/.test(entitySecret)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The entity secret on the server is not a 64 character hex value',
    })
  }

  return {
    apiKey,
    entitySecret,
    baseUrl: String(config.circleBaseUrl || 'https://api.circle.com'),
    blockchain: String(config.circleBlockchain || 'MATIC-AMOY'),
    accountType: String(config.circleAccountType || 'SCA'),
    maxSendUsdc: Number(config.maxSendUsdc) > 0 ? Number(config.maxSendUsdc) : 100,
  }
}

function circleErrorMessage(err: any): string {
  const message = err?.data?.message || err?.statusMessage || err?.message
  return typeof message === 'string' && message ? message : 'Circle request failed'
}

async function circleRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST'
    body?: Record<string, unknown>
    query?: Record<string, string | number | boolean>
  } = {},
): Promise<T> {
  const settings = circleSettings()
  try {
    return await $fetch<any>(`${settings.baseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
        'X-Request-Id': randomUUID(),
      },
      body: options.body,
      query: options.query,
    })
  } catch (err: any) {
    console.error('Circle request failed', path, err?.statusCode, err?.data)
    throw createError({
      statusCode: err?.statusCode && err.statusCode < 500 ? 400 : 502,
      statusMessage: circleErrorMessage(err),
    })
  }
}

/** Builds a stable UUID (v4 format) from any text, for safe retries. */
export function uuidFromSeed(seed: string): string {
  const bytes = createHash('sha256').update(seed).digest().subarray(0, 16)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = bytes.toString('hex')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-')
}

export function isUuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  )
}

export function isAddress(value: unknown): value is string {
  return typeof value === 'string' && EVM_ADDRESS.test(value)
}

/** Converts a decimal USDC string to micro-units. Returns null if invalid. */
export function usdcToMicro(value: string): bigint | null {
  const match = /^(\d+)(?:\.(\d{1,6}))?$/.exec(value.trim())
  if (!match) {
    return null
  }
  const whole = BigInt(match[1])
  const fraction = (match[2] || '').padEnd(USDC_DECIMALS, '0')
  return whole * BigInt(10 ** USDC_DECIMALS) + BigInt(fraction || '0')
}

async function entitySecretCiphertext(): Promise<string> {
  const settings = circleSettings()
  if (!cachedPublicKey) {
    const result = await circleRequest<{ data: { publicKey: string } }>(
      '/v1/w3s/config/entity/publicKey',
    )
    cachedPublicKey = result.data.publicKey
  }
  // A fresh ciphertext is needed for every request, which OAEP gives us.
  return publicEncrypt(
    {
      key: cachedPublicKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(settings.entitySecret, 'hex'),
  ).toString('base64')
}

/** The wallet set that holds every user's wallet. Created once, then reused. */
async function walletSetId(): Promise<string> {
  const config = useRuntimeConfig()
  const fromEnv = String(config.circleWalletSetId || '')
  if (fromEnv) {
    return fromEnv
  }

  const stored = await getSetting('circle_wallet_set_id')
  if (stored) {
    return stored
  }

  const created = await circleRequest<{ data: { walletSet: { id: string } } }>(
    '/v1/w3s/developer/walletSets',
    {
      method: 'POST',
      body: {
        idempotencyKey: uuidFromSeed('app-wallet-set'),
        entitySecretCiphertext: await entitySecretCiphertext(),
        name: 'Mondo users',
      },
    },
  )
  const id = created.data.walletSet.id
  await saveSetting('circle_wallet_set_id', id)
  return id
}

/** Creates the user's wallet once. Safe to call again: it never makes a second. */
export async function createWalletForUser(userId: string): Promise<WalletRow> {
  const existing = await getWalletRow(userId)
  if (existing) {
    return existing
  }

  const settings = circleSettings()
  const result = await circleRequest<{ data: { wallets: CircleWallet[] } }>(
    '/v1/w3s/developer/wallets',
    {
      method: 'POST',
      body: {
        idempotencyKey: uuidFromSeed(`wallet:${userId}`),
        entitySecretCiphertext: await entitySecretCiphertext(),
        walletSetId: await walletSetId(),
        blockchains: [settings.blockchain],
        accountType: settings.accountType,
        count: 1,
        metadata: [{ name: 'Main wallet', refId: userId }],
      },
    },
  )

  const wallet = result.data.wallets[0]
  if (!wallet) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Circle did not return a wallet',
    })
  }

  return await saveWalletRow({
    user_id: userId,
    circle_wallet_id: wallet.id,
    address: wallet.address,
    blockchain: wallet.blockchain,
  })
}

export async function getBalances(circleWalletId: string): Promise<TokenBalance[]> {
  const result = await circleRequest<{ data: { tokenBalances?: TokenBalance[] } }>(
    `/v1/w3s/wallets/${encodeURIComponent(circleWalletId)}/balances`,
  )
  return result.data.tokenBalances || []
}

export function isUsdc(balance: TokenBalance): boolean {
  const symbol = (balance.token.symbol || '').toUpperCase()
  return symbol.startsWith('USDC')
}

/** Sends USDC from the user's wallet. Returns Circle's transaction id and state. */
export async function sendUsdc(
  wallet: WalletRow,
  destination: string,
  amount: string,
  idempotencyKey: string,
): Promise<{ id: string; state: string }> {
  const settings = circleSettings()

  if (!isAddress(destination)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Enter a valid wallet address that starts with 0x',
    })
  }
  if (destination.toLowerCase() === wallet.address.toLowerCase()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot send to your own wallet address',
    })
  }

  const micro = usdcToMicro(amount)
  if (micro === null || micro <= BigInt(0)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Enter an amount greater than 0 with up to 6 decimals',
    })
  }
  if (micro > BigInt(Math.round(settings.maxSendUsdc * 10 ** USDC_DECIMALS))) {
    throw createError({
      statusCode: 400,
      statusMessage: `The maximum per transfer is ${settings.maxSendUsdc} USDC`,
    })
  }

  const balances = await getBalances(wallet.circle_wallet_id)
  const usdc = balances.find(isUsdc)
  const available = usdc ? usdcToMicro(usdc.amount) : null
  if (!usdc || available === null || available <= BigInt(0)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Your wallet has no USDC yet. Get test USDC from the Circle faucet first',
    })
  }
  if (micro > available) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Your balance is too low for this transfer',
    })
  }

  const result = await circleRequest<{ data: { id: string; state: string } }>(
    '/v1/w3s/developer/transactions/transfer',
    {
      method: 'POST',
      body: {
        idempotencyKey,
        entitySecretCiphertext: await entitySecretCiphertext(),
        walletId: wallet.circle_wallet_id,
        tokenId: usdc.token.id,
        destinationAddress: destination,
        amounts: [amount.trim()],
        feeLevel: 'MEDIUM',
        refId: `send:${wallet.user_id}`,
      },
    },
  )
  return result.data
}

export async function listTransactions(
  circleWalletId: string,
): Promise<CircleTransaction[]> {
  const result = await circleRequest<{
    data: { transactions?: CircleTransaction[] }
  }>('/v1/w3s/transactions', {
    query: { walletIds: circleWalletId, pageSize: 50, order: 'DESC' },
  })
  return result.data.transactions || []
}
