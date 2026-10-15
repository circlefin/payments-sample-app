import type { BankCurrency } from '~/utils/bank'

export interface BankStatus {
  customerType: 'individual' | 'business' | string
  kycStatus: string
  tosStatus: string
  kycLink: string
  tosLink: string
  customerId: string
  approved: boolean
}

export interface BankAccount {
  currency: BankCurrency
  instructions: Record<string, unknown>
}

export interface BankDeposit {
  id: string
  currency: string
  type: string
  amount: string
  date: string
}

/** Shared state for the Bank accounts screen. */
export function useBank() {
  const { api } = useAuth()

  const configured = useState<boolean>('fm-bank-configured', () => true)
  const live = useState<boolean>('fm-bank-live', () => false)
  const status = useState<BankStatus | null>('fm-bank-status', () => null)
  const accounts = useState<BankAccount[]>('fm-bank-accounts', () => [])
  const deposits = useState<BankDeposit[]>('fm-bank-deposits', () => [])

  async function load(): Promise<void> {
    const result = await api<{
      configured: boolean
      live: boolean
      status: BankStatus | null
      accounts: BankAccount[]
    }>('/api/bank')
    configured.value = result.configured
    live.value = result.live
    status.value = result.status
    accounts.value = result.accounts
  }

  async function loadDeposits(): Promise<void> {
    if (accounts.value.length === 0) {
      deposits.value = []
      return
    }
    const result = await api<{ deposits: BankDeposit[] }>('/api/bank/history')
    deposits.value = result.deposits
  }

  async function startVerification(
    fullName: string,
    type: 'individual' | 'business',
  ): Promise<void> {
    const result = await api<{ status: BankStatus }>('/api/bank/kyc', {
      method: 'POST',
      body: { fullName, type },
    })
    status.value = result.status
  }

  async function openAccount(currency: BankCurrency): Promise<void> {
    const result = await api<{ account: BankAccount }>('/api/bank/accounts', {
      method: 'POST',
      body: { currency },
    })
    accounts.value = [
      ...accounts.value.filter((a) => a.currency !== currency),
      result.account,
    ]
  }

  async function simulateApproval(): Promise<void> {
    const result = await api<{ status: BankStatus }>(
      '/api/bank/simulate-kyc',
      { method: 'POST' },
    )
    status.value = result.status
  }

  async function simulateDeposit(
    currency: BankCurrency,
    amount: string,
  ): Promise<void> {
    await api('/api/bank/simulate-deposit', {
      method: 'POST',
      body: { currency, amount },
    })
  }

  function reset(): void {
    status.value = null
    accounts.value = []
    deposits.value = []
  }

  return {
    configured,
    live,
    status,
    accounts,
    deposits,
    load,
    loadDeposits,
    startVerification,
    openAccount,
    simulateApproval,
    simulateDeposit,
    reset,
  }
}
