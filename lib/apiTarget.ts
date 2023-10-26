/**
 * Copyright 2023 Circle Internet Financial, LTD.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Silly hacky way to determine the API endpoint from the current hostname.  Nuxt makes it
 * surprisingly difficult to add serverside runtime environment variables (to then serve to
 * the client via a configuration endpoint), so we're stuck using this.  We can get away with
 * this because we have very consistent naming between our environments.
 */

function getAPIHostname() {
  // If app is running on localhost (ie, in  dev) the URL is provided via an environment variable (.env file), use that.
  // Otherwise, base it off the window location.
  if (window.location && window.location.hostname === 'localhost') {
    return process.env.baseUrl
  }
  return window.location.origin.replace('sample', 'api')
}

function getLive() {
  const hostname = getAPIHostname()
  return !(hostname!.includes('sandbox') || hostname!.includes('smokebox'))
}

function getIsStaging() {
  const hostname = getAPIHostname()
  return hostname!.includes('staging')
}

function getIsLocalHost(): boolean {
  const hostname = getAPIHostname()
  return hostname!.includes(':3011')
}

export { getAPIHostname, getLive, getIsStaging, getIsLocalHost }
