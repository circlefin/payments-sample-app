/**
 * Silly hacky way to determine the API endpoint from the current hostname.  Nuxt makes it
 * surprisingly difficult to add serverside runtime environment variables (to then serve to
 * the client via a configuration endpoint), so we're stuck using this.  We can get away with
 * this because we have very consistent naming between our environments.
 */

function getAPIHostname() {
  // If app is running on localhost (ie, in dev) the URL is provided via the
  // BASE_URL env var, exposed to the client through Nuxt's public runtimeConfig.
  // Otherwise, base it off the window location.
  if (window.location && window.location.hostname === 'localhost') {
    const runtimeBaseUrl = (window as any).__NUXT__?.config?.public?.baseUrl
    return runtimeBaseUrl || 'https://api-sandbox.circle.com'
  }
  return window.location.origin.replace('sample', 'api')
}

function getIsInternal() {
  const hostname = getAPIHostname()
  return (
    hostname?.includes('staging') || hostname?.includes('smokebox') || false
  )
}

function getLive() {
  const hostname = getAPIHostname()
  return (
    !(hostname?.includes('sandbox') || hostname?.includes('smokebox')) &&
    !!hostname
  )
}

function getIsStaging() {
  const hostname = getAPIHostname()
  return hostname?.includes('staging') || false
}

function getIsLocalHost(): boolean {
  const hostname = getAPIHostname()
  return hostname?.includes(':3011') || false
}

function getIsNotStagingOrSmokebox(): boolean {
  const hostname = getAPIHostname()
  return !(hostname?.includes('staging') || hostname?.includes('smokebox'))
}

export {
  getAPIHostname,
  getIsInternal,
  getLive,
  getIsStaging,
  getIsLocalHost,
  getIsNotStagingOrSmokebox,
}
