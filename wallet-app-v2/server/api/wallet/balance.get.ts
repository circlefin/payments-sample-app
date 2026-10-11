import { requireUser } from '../../utils/auth'
import { getBalances, isUsdc } from '../../utils/circle'
import { getWalletRow } from '../../utils/db'

// USDC balance and any other token balances for the signed-in user's wallet.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const wallet = await getWalletRow(user.id)
  if (!wallet) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Create your wallet first',
    })
  }

  const balances = await getBalances(wallet.circle_wallet_id)
  const usdc = balances.find(isUsdc)

  return {
    usdc: usdc ? usdc.amount : '0',
    others: balances
      .filter((b) => !isUsdc(b))
      .map((b) => ({
        symbol: b.token.symbol || 'Token',
        amount: b.amount,
      })),
  }
})
