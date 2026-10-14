// Tells the browser whether the server is using a live Circle key, so the
// screens can say so honestly. It returns only yes/no flags and the network
// name. No key or secret is ever included.
export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const apiKey = String(config.circleApiKey || '')
  return {
    configured: apiKey.length > 0,
    live: apiKey.length > 0 && !apiKey.startsWith('TEST_API_KEY:'),
    blockchain: String(config.circleBlockchain || 'MATIC-AMOY'),
  }
})
