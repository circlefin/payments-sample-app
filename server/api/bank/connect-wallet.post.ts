import { rateLimit, requireUser } from '../../utils/auth'
import { requireApprovedCustomer } from '../../utils/bank'
import { railForBlockchain } from '../../utils/bankRules'
import { bridgeMode, bridgeRequest } from '../../utils/bridge'
import {
  getWalletRow,
  listBankAccounts,
  markBankAccountConnected,
} from '../../utils/db'

// Points the user's test bank accounts at their real Mondo wallet. Used after a
// test account was opened before the wallet existed. Safe to call again.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  rateLimit(user.id, 'bank-connect', 5, 60_000)

  const pending = (await listBankAccounts(user.id)).filter((a) => a.placeholder)
  if (pending.length === 0) {
    return { connected: 0 }
  }

  const wallet = await getWalletRow(user.id)
  if (!wallet) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Create your wallet first',
    })
  }
  const rail = railForBlockchain(wallet.blockchain, bridgeMode().live)
  if (!rail) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Your wallet is on a network Bridge cannot send to',
    })
  }

  const { status } = await requireApprovedCustomer(user.id)
  for (const account of pending) {
    await bridgeRequest(
      `/customers/${encodeURIComponent(status.customerId)}/virtual_accounts/${encodeURIComponent(account.bridge_account_id)}`,
      {
        method: 'PUT',
        body: {
          destination: {
            payment_rail: rail,
            currency: 'usdc',
            address: wallet.address,
          },
        },
      },
    )
    await markBankAccountConnected(user.id, account.currency)
  }
  return { connected: pending.length }
})
