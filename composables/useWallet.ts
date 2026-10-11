/** Shared wallet state, so every page shows the same balance and address. */

export interface WalletInfo {
  address: string
  blockchain: string
}

export interface ActivityItem {
  id: string
  direction: 'sent' | 'received'
  state: string
  amount: string
  counterparty: string
  date: string
  txHash: string
}

const NETWORK_NAMES: Record<string, string> = {
  'MATIC-AMOY': 'Polygon Amoy (test network)',
  'ETH-SEPOLIA': 'Ethereum Sepolia (test network)',
  'BASE-SEPOLIA': 'Base Sepolia (test network)',
  'ARB-SEPOLIA': 'Arbitrum Sepolia (test network)',
  'AVAX-FUJI': 'Avalanche Fuji (test network)',
  'OP-SEPOLIA': 'Optimism Sepolia (test network)',
}

export function networkName(blockchain: string): string {
  return NETWORK_NAMES[blockchain] || `${blockchain} (test network)`
}

export function shortAddress(address: string): string {
  return address.length > 14
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : address
}

/** Shows 12.5 as "12.50" and keeps up to 6 decimals when they matter. */
export function formatUsdc(value: string | number): string {
  const number = Number(value)
  if (!Number.isFinite(number)) {
    return '0.00'
  }
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}

export function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function stateLabel(state: string): string {
  switch (state) {
    case 'COMPLETE':
    case 'CONFIRMED':
      return 'Complete'
    case 'FAILED':
    case 'DENIED':
    case 'CANCELLED':
      return 'Failed'
    default:
      return 'Pending'
  }
}

export function useWallet() {
  const { api } = useAuth()

  const wallet = useState<WalletInfo | null>('fm-wallet', () => null)
  const walletLoaded = useState<boolean>('fm-wallet-loaded', () => false)
  const usdc = useState<string>('fm-usdc', () => '0')
  const activity = useState<ActivityItem[]>('fm-activity', () => [])

  async function loadWallet(): Promise<void> {
    const result = await api<{ wallet: WalletInfo | null }>('/api/wallet')
    wallet.value = result.wallet
    walletLoaded.value = true
  }

  async function loadBalance(): Promise<void> {
    if (!wallet.value) {
      return
    }
    const result = await api<{ usdc: string }>('/api/wallet/balance')
    usdc.value = result.usdc
  }

  async function loadActivity(): Promise<void> {
    if (!wallet.value) {
      activity.value = []
      return
    }
    const result = await api<{ transactions: ActivityItem[] }>(
      '/api/transactions',
    )
    activity.value = result.transactions
  }

  async function createWallet(): Promise<void> {
    const result = await api<{ wallet: WalletInfo }>('/api/wallet', {
      method: 'POST',
    })
    wallet.value = result.wallet
    walletLoaded.value = true
    usdc.value = '0'
  }

  function reset(): void {
    wallet.value = null
    walletLoaded.value = false
    usdc.value = '0'
    activity.value = []
  }

  return {
    wallet,
    walletLoaded,
    usdc,
    activity,
    loadWallet,
    loadBalance,
    loadActivity,
    createWallet,
    reset,
  }
}
