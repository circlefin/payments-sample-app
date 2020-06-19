import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

const instance = axios.create({
  baseURL: getAPIHostname(),
})

/**
 * Global error handler:
 * Intercepts all axios reponses and maps
 * to errorHandler object
 */
instance.interceptors.response.use(
  function (response) {
    if (get(response, 'data.data')) {
      return response.data.data
    }
    return response
  },
  function (error) {
    let response = get(error, 'response')
    if (!response) {
      response = error.toJSON()
    }
    return Promise.reject(response)
  }
)

const nullIfEmpty = (prop: string | undefined) => {
  if (prop !== undefined && prop.trim() === '') {
    return undefined
  }
  return prop
}

/** Returns the axios instance */
function getInstance() {
  return instance
}

/**
 * Get Addresses
 * @param {String} walletId
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 */
function getAddresses(
  walletId: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string
) {
  const queryParams = {
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }

  const url = `/v1/wallets/${walletId}/addresses`

  return instance.get(url, { params: queryParams })
}

/**
 * Create Address
 * @param {*} payload (contains form data and encrypted Address details)
 */
function createAddress(
  walletId: string,
  idempotencyKey: string,
  currency: string,
  chain: string
) {
  const url = `/v1/wallets/${walletId}/addresses`
  const payload = {
    idempotencyKey,
    currency,
    chain,
  }
  return instance.post(url, payload)
}

export default {
  getInstance,
  getAddresses,
  createAddress,
}
