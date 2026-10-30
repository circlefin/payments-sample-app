import { rateLimit, requireUser } from '../../utils/auth'
import { bridgeLinkSeed, bridgeRequest, type KycLink } from '../../utils/bridge'
import {
  cleanName,
  isCustomerType,
  parseEndorsements,
} from '../../utils/bankRules'
import { refreshBankStatus } from '../../utils/bank'
import { getBankCustomer, saveBankCustomer } from '../../utils/db'

interface KycBody {
  fullName?: unknown
  type?: unknown
}

// Starts identity verification with Bridge. Calling it again returns the same
// verification, so double clicks never create duplicates.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  rateLimit(user.id, 'bank-kyc', 5, 60_000)

  const existing = await getBankCustomer(user.id)
  if (existing) {
    return { status: await refreshBankStatus(existing) }
  }

  const body = (await readBody<KycBody>(event)) || {}
  const fullName = cleanName(body.fullName)
  if (!fullName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Enter your full legal name',
    })
  }
  if (!isCustomerType(body.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose personal or business',
    })
  }
  if (!user.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Your account needs an email address',
    })
  }

  const endorsements = parseEndorsements(
    useRuntimeConfig().bridgeEndorsements,
  )
  const link = await bridgeRequest<KycLink>('/kyc_links', {
    method: 'POST',
    idempotencyKey: bridgeLinkSeed(user.id),
    body: {
      full_name: fullName,
      email: user.email,
      type: body.type,
      redirect_uri: `${getRequestURL(event).origin}/bank`,
      ...(endorsements.length > 0 ? { endorsements } : {}),
    },
  })
  if (!link.id) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Bridge did not return a verification link',
    })
  }

  const row = await saveBankCustomer({
    user_id: user.id,
    kyc_link_id: link.id,
    customer_id: link.customer_id || null,
    customer_type: body.type,
  })
  return { status: await refreshBankStatus(row) }
})
