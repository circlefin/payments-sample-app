import { rateLimit, requireUser } from '../utils/auth'
import { isUuid, sendUsdc } from '../utils/circle'
import { getWalletRow } from '../utils/db'

interface TransferBody {
  to?: unknown
  amount?: unknown
  requestId?: unknown
}

// Sends USDC from the signed-in user's own wallet. The wallet is looked up from
// the verified user, never from anything the browser sends.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  rateLimit(user.id, 'transfer', 10, 60_000)

  const body = (await readBody<TransferBody>(event)) || {}
  const to = typeof body.to === 'string' ? body.to.trim() : ''
  const amount = typeof body.amount === 'string' ? body.amount.trim() : ''
  const requestId = isUuid(body.requestId) ? body.requestId : ''

  if (!to || !amount || !requestId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Recipient, amount and request id are required',
    })
  }

  const wallet = await getWalletRow(user.id)
  if (!wallet) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Create your wallet first',
    })
  }

  const transfer = await sendUsdc(wallet, to, amount, requestId)
  return { id: transfer.id, state: transfer.state }
})
