import { rateLimit, requireUser } from '../../utils/auth'
import { requireApprovedCustomer } from '../../utils/bank'
import { isBankCurrency, railForBlockchain } from '../../utils/bankRules'
import { bridgeMode, bridgeRequest } from '../../utils/bridge'
import { uuidFromSeed } from '../../utils/circle'
import { getWalletRow, listBankAccounts, saveBankAccount } from '../../utils/db'

interface AccountBody {
  currency?: unknown
}

interface VirtualAccount {
  id: string
  source_deposit_instructions?: Record<string, unknown>
}

// Opens a USD, EUR or GBP account. Money paid into it is converted to USDC and
// delivered to the user's own Mondo wallet.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  rateLimit(user.id, 'bank-account', 5, 60_000)

  const body = (await readBody<AccountBody>(event)) || {}
  if (!isBankCurrency(body.currency)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose USD, EUR or GBP',
    })
  }
  const currency = body.currency

  const existing = (await listBankAccounts(user.id)).find(
    (a) => a.currency === currency,
  )
  if (existing) {
    return {
      account: { currency, instructions: existing.deposit_instructions },
    }
  }

  const { status } = await requireApprovedCustomer(user.id)

  const wallet = await getWalletRow(user.id)
  if (!wallet) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Create your wallet first, so there is somewhere to send the money',
    })
  }

  const rail = railForBlockchain(wallet.blockchain, bridgeMode().live)
  if (!rail) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Live bank accounts need a wallet on a real network. Your wallet is on a test network',
    })
  }

  const account = await bridgeRequest<VirtualAccount>(
    `/customers/${encodeURIComponent(status.customerId)}/virtual_accounts`,
    {
      method: 'POST',
      idempotencyKey: uuidFromSeed(`mondo-va:${user.id}:${currency}`),
      body: {
        source: { currency },
        destination: {
          payment_rail: rail,
          currency: 'usdc',
          address: wallet.address,
        },
      },
    },
  )
  if (!account.id || !account.source_deposit_instructions) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Bridge did not return account details',
    })
  }

  const saved = await saveBankAccount({
    user_id: user.id,
    currency,
    bridge_account_id: account.id,
    deposit_instructions: account.source_deposit_instructions,
  })
  return {
    account: { currency, instructions: saved.deposit_instructions },
  }
})
