import { rateLimit, requireUser } from '../../utils/auth'
import { requireApprovedCustomer } from '../../utils/bank'
import { cleanAmount, isBankCurrency } from '../../utils/bankRules'
import { bridgeRequest, requireSandbox } from '../../utils/bridge'
import { listBankAccounts } from '../../utils/db'

interface DepositBody {
  currency?: unknown
  amount?: unknown
}

// TEST ONLY. Pretends a bank transfer arrived, in the Bridge sandbox. Refuses
// to run with a live Bridge key.
export default defineEventHandler(async (event) => {
  requireSandbox()
  const user = await requireUser(event)
  rateLimit(user.id, 'bank-sim-deposit', 10, 60_000)

  const body = (await readBody<DepositBody>(event)) || {}
  const amount = cleanAmount(body.amount, 10_000)
  if (!isBankCurrency(body.currency) || !amount) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a currency and an amount up to 10,000',
    })
  }

  const account = (await listBankAccounts(user.id)).find(
    (a) => a.currency === body.currency,
  )
  if (!account) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Open that account first',
    })
  }

  const { status } = await requireApprovedCustomer(user.id)
  await bridgeRequest(
    `/customers/${encodeURIComponent(status.customerId)}/virtual_accounts/${encodeURIComponent(account.bridge_account_id)}/simulate_deposit`,
    {
      method: 'POST',
      body: { currency: body.currency, amount },
    },
  )
  return { ok: true }
})
