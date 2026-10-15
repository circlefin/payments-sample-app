/** Helpers for showing bank account details. No network access in here. */

export type BankCurrency = 'usd' | 'eur' | 'gbp'

export const CURRENCY_INFO: Record<
  BankCurrency,
  { code: string; name: string; symbol: string; how: string; note?: string }
> = {
  usd: {
    code: 'USD',
    name: 'US dollars',
    symbol: '$',
    how: 'ACH or wire transfer',
  },
  eur: {
    code: 'EUR',
    name: 'Euros',
    symbol: '€',
    how: 'SEPA bank transfer',
  },
  gbp: {
    code: 'GBP',
    name: 'British pounds',
    symbol: '£',
    how: 'Faster Payments',
    note: 'Pay in from your own UK bank account. Payments from other people are accepted only from businesses.',
  },
}

const LABELS: Record<string, string> = {
  bank_name: 'Bank',
  bank_address: 'Bank address',
  bank_beneficiary_name: 'Account name',
  bank_beneficiary_address: 'Account holder address',
  account_holder_name: 'Account name',
  bank_routing_number: 'Routing number',
  bank_account_number: 'Account number',
  account_number: 'Account number',
  sort_code: 'Sort code',
  iban: 'IBAN',
  bic: 'BIC / SWIFT',
  deposit_message: 'Reference (include this)',
  payment_rail: 'Transfer type',
  payment_rails: 'Transfer types',
}

export interface DepositRow {
  key: string
  label: string
  value: string
  copyable: boolean
}

const NOT_COPYABLE = new Set(['payment_rail', 'payment_rails', 'bank_address', 'bank_beneficiary_address'])

function prettyKey(key: string): string {
  const text = key.replace(/_/g, ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Turns Bridge's deposit instructions into labelled rows, in a sensible order.
 * Only plain text, numbers and short lists of text are shown; anything else is
 * skipped rather than printed as raw data.
 */
export function depositRows(
  instructions: Record<string, unknown> | null | undefined,
): DepositRow[] {
  if (!instructions || typeof instructions !== 'object') {
    return []
  }
  const order = Object.keys(LABELS)
  const rows: DepositRow[] = []
  for (const [key, raw] of Object.entries(instructions)) {
    let value = ''
    if (typeof raw === 'string' || typeof raw === 'number') {
      value = String(raw).trim()
    } else if (
      Array.isArray(raw) &&
      raw.every((item) => typeof item === 'string')
    ) {
      value = raw.map((item) => String(item).toUpperCase()).join(', ')
    }
    if (!value) {
      continue
    }
    rows.push({
      key,
      label: LABELS[key] || prettyKey(key),
      value,
      copyable: !NOT_COPYABLE.has(key),
    })
  }
  const rank = (key: string) => {
    const i = order.indexOf(key)
    return i === -1 ? order.length : i
  }
  return rows.sort((a, b) => rank(a.key) - rank(b.key))
}

export function kycHeadline(
  kycStatus: string,
  tosStatus: string,
  approved: boolean,
): string {
  if (approved) {
    return 'Verified'
  }
  if (kycStatus === 'rejected') {
    return 'Not approved'
  }
  if (kycStatus === 'under_review') {
    return 'Under review'
  }
  if (kycStatus === 'incomplete') {
    return 'More information needed'
  }
  if (tosStatus !== 'approved') {
    return 'Terms not accepted yet'
  }
  return 'Waiting for verification'
}
