import { requireUser } from '../utils/auth'
import { listTransactions } from '../utils/circle'
import { getWalletRow } from '../utils/db'

// Recent activity (sent and received) for the signed-in user's wallet.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const wallet = await getWalletRow(user.id)
  if (!wallet) {
    return { transactions: [] }
  }

  const items = await listTransactions(wallet.circle_wallet_id)
  return {
    transactions: items.map((t) => {
      const sent = t.transactionType === 'OUTBOUND'
      return {
        id: t.id,
        direction: sent ? 'sent' : 'received',
        state: t.state,
        amount: t.amounts && t.amounts.length > 0 ? t.amounts[0] : '',
        counterparty: sent ? t.destinationAddress || '' : t.sourceAddress || '',
        date: t.createDate || '',
        txHash: t.txHash || '',
      }
    }),
  }
})
