import { rateLimit, requireUser } from '../../utils/auth'
import { createWalletForUser } from '../../utils/circle'

// Creates the signed-in user's wallet. Calling it again returns the same wallet.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  rateLimit(user.id, 'create-wallet', 5, 60_000)
  const wallet = await createWalletForUser(user.id)
  return {
    wallet: { address: wallet.address, blockchain: wallet.blockchain },
  }
})
