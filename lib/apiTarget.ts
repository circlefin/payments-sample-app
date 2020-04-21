/**
 * Silly hacky way to determine the API endpoint from the current hostname.  Nuxt makes it
 * surprisingly difficult to add serverside runtime environment variables (to then serve to
 * the client via a configuration endpoint), so we're stuck using this.  We can get away with
 * this because we have very consistent naming between our environments.
 */

function getAPIHostname() {
  // If the URL is provided via an environment variable (ie, in dev) use that.
  // Otherwise, base it off the window location.
  return process.env.baseUrl || window.location.origin.replace('sample', 'api')
}

function getLive() {
  const hostname = getAPIHostname()
  return !(hostname.includes('sandbox') || hostname.includes('smokebox'))
}

export { getAPIHostname, getLive }
