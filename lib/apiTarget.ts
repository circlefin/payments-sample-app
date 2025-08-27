/**
 * Determine the API endpoint from the current hostname or runtime config.
 * Updated for Nuxt 3 compatibility.
 */

function getAPIHostname() {
  // Try to get the runtime config first (works in both server and client context in Nuxt 3)
  try {
    const config = useRuntimeConfig()
    if (config?.public?.baseUrl) {
      return config.public.baseUrl
    }
  } catch (error) {
    // useRuntimeConfig might not be available in some contexts
  }

  // If app is running on localhost (ie, in dev) and we have window access
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.hostname === 'localhost'
  ) {
    // Fallback to environment variable or default
    return process.env.BASE_URL || 'https://api-sandbox.circle.com'
  }

  if (typeof window !== 'undefined') {
    return window.location.origin.replace('sample', 'api')
  }

  // Fallback for SSR context
  return 'https://api-sandbox.circle.com'
}

function getIsInternal() {
  const hostname = getAPIHostname()
  return (
    hostname?.includes('staging') || hostname?.includes('smokebox') || false
  )
}

function getLive() {
  const hostname = getAPIHostname()
  return !(hostname?.includes('sandbox') || hostname?.includes('smokebox'))
}

function getIsStaging() {
  const hostname = getAPIHostname()
  return hostname?.includes('staging') || false
}

function getIsLocalHost(): boolean {
  const hostname = getAPIHostname()
  return hostname?.includes(':3011') || false
}

export { getAPIHostname, getIsInternal, getLive, getIsStaging, getIsLocalHost }
