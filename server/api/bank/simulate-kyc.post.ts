import { rateLimit, requireUser } from '../../utils/auth'
import { refreshBankStatus } from '../../utils/bank'
import { bridgeRequest, requireSandbox } from '../../utils/bridge'
import { getBankCustomer } from '../../utils/db'

// TEST ONLY. Approves the signed-in user's verification in the Bridge sandbox.
// Refuses to run with a live Bridge key.
export default defineEventHandler(async (event) => {
  requireSandbox()
  const user = await requireUser(event)
  rateLimit(user.id, 'bank-sim-kyc', 10, 60_000)

  const row = await getBankCustomer(user.id)
  if (!row) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Start verification first',
    })
  }
  const before = await refreshBankStatus(row)
  if (!before.customerId) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Bridge has no customer yet. Open the verification link and the terms link once, then try again',
    })
  }
  await bridgeRequest(
    `/customers/${encodeURIComponent(before.customerId)}/simulate_kyc_approval`,
    { method: 'POST', body: {} },
  )
  return { status: await refreshBankStatus(row) }
})
