import { requireUser } from '../../utils/auth'
import { getWalletRow } from '../../utils/db'

// Returns the signed-in user's wallet, or null if they have not made one yet.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const wallet = await getWalletRow(user.id)
  return {
    wallet: wallet
      ? { address: wallet.address, blockchain: wallet.blockchain }
      : null,
  }
})
