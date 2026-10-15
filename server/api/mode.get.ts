import { bridgeMode } from '../utils/bridge'

// Tells the browser whether the server is using a live Circle key, so the
// screens can say so honestly. It returns only yes/no flags and the network
// name. No key or secret is ever included.
import { cleanCredential } from '../utils/clean'

export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const apiKey = cleanCredential(config.circleApiKey)
  const bank = bridgeMode()
  return {
    configured: apiKey.length > 0,
    live: apiKey.length > 0 && !apiKey.startsWith('TEST_API_KEY:'),
    blockchain: String(config.circleBlockchain || 'MATIC-AMOY'),
    bankConfigured: bank.configured,
    bankLive: bank.live,
  }
})
