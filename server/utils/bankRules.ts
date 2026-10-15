/**
 * Pure rules for bank accounts. Nothing in here talks to the network, so they
 * can be tested on their own.
 */

import { createHash } from 'node:crypto'

export type BankCurrency = 'usd' | 'eur' | 'gbp'
export type CustomerType = 'individual' | 'business'

export const BANK_CURRENCIES: BankCurrency[] = ['usd', 'eur', 'gbp']

export function isBankCurrency(value: unknown): value is BankCurrency {
  return typeof value === 'string' && (BANK_CURRENCIES as string[]).includes(value)
}

export function isCustomerType(value: unknown): value is CustomerType {
  return value === 'individual' || value === 'business'
}

const ENDORSEMENTS = ['sepa', 'faster_payments']

/**
 * Optional extra permissions to ask Bridge for during verification, taken from
 * the BRIDGE_ENDORSEMENTS setting (for example "sepa,faster_payments"). EUR and
 * GBP accounts may need them. Unknown words are ignored, so a typo cannot break
 * sign-up.
 */
export function parseEndorsements(value: unknown): string[] {
  if (typeof value !== 'string') {
    return []
  }
  const wanted = value
    .split(',')
    .map((word) => word.trim().toLowerCase())
    .filter((word) => ENDORSEMENTS.includes(word))
  return Array.from(new Set(wanted))
}

const MAINNET_RAILS: Record<string, string> = {
  MATIC: 'polygon',
  ETH: 'ethereum',
  BASE: 'base',
  ARB: 'arbitrum',
  AVAX: 'avalanche_c_chain',
  OP: 'optimism',
}

const TESTNET_RAILS: Record<string, string> = {
  'MATIC-AMOY': 'polygon',
  'ETH-SEPOLIA': 'ethereum',
  'BASE-SEPOLIA': 'base',
  'ARB-SEPOLIA': 'arbitrum',
  'AVAX-FUJI': 'avalanche_c_chain',
  'OP-SEPOLIA': 'optimism',
}

/**
 * Which Bridge payment rail matches a wallet's network. Test networks are only
 * accepted in the Bridge sandbox, where no money really moves. With a live
 * Bridge key a test-network wallet is refused (returns null), because real USDC
 * would be sent to an address on the wrong network.
 */
export function railForBlockchain(
  blockchain: string,
  bridgeLive: boolean,
): string | null {
  if (MAINNET_RAILS[blockchain]) {
    return MAINNET_RAILS[blockchain]
  }
  if (!bridgeLive && TESTNET_RAILS[blockchain]) {
    return TESTNET_RAILS[blockchain]
  }
  return null
}

/**
 * A well-formed but meaningless wallet address, different for every user. It is
 * used ONLY with a Bridge sandbox key, where no money moves, so test bank
 * accounts can be opened before a real wallet exists. The account is switched
 * to the user's real wallet address later.
 */
export function sandboxPlaceholderAddress(userId: string): string {
  return '0x' + createHash('sha256').update(`mondo-sandbox:${userId}`).digest('hex').slice(0, 40)
}

/** Full legal name: 2 to 100 characters, trimmed, single spaces. */
export function cleanName(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }
  const name = value.replace(/\s+/g, ' ').trim()
  return name.length >= 2 && name.length <= 100 ? name : ''
}

/** A positive amount with at most 2 decimals and an upper limit, as text. */
export function cleanAmount(value: unknown, max: number): string {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(text)) {
    return ''
  }
  const number = Number(text)
  return number > 0 && number <= max ? text : ''
}

export function bridgeIsLive(apiKey: string): boolean {
  return !apiKey.startsWith('sk-test')
}
