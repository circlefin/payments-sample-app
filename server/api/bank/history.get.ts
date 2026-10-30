import { requireUser } from '../../utils/auth'
import { requireApprovedCustomer } from '../../utils/bank'
import { bridgeRequest } from '../../utils/bridge'
import { listBankAccounts } from '../../utils/db'

interface HistoryItem {
  id?: string
  type?: string
  amount?: string
  currency?: string
  created_at?: string
  deposit_id?: string
}

// Recent deposits into the user's bank accounts, newest first.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const accounts = await listBankAccounts(user.id)
  if (accounts.length === 0) {
    return { deposits: [] }
  }
  const { status } = await requireApprovedCustomer(user.id)

  const lists = await Promise.all(
    accounts.map(async (a) => {
      const result = await bridgeRequest<{ data?: HistoryItem[] }>(
        `/customers/${encodeURIComponent(status.customerId)}/virtual_accounts/${encodeURIComponent(a.bridge_account_id)}/history`,
      )
      return (result.data || []).map((item) => ({
        id: String(item.id || item.deposit_id || ''),
        currency: a.currency,
        type: String(item.type || ''),
        amount: String(item.amount || ''),
        date: String(item.created_at || ''),
      }))
    }),
  )
  const deposits = lists
    .flat()
    .sort((x, y) => (x.date < y.date ? 1 : -1))
    .slice(0, 20)
  return { deposits }
})
