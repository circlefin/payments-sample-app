import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from '../apiTarget'

export interface CreateDepositAddressPayload {
  idempotencyKey: string
  currency: string
  chain: string
}

export interface CreateRecipientAddressPayload {
  idempotencyKey: string
  address: string
  chain: string
  description: string
}

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


/** Returns the axios instance */
function getInstance() {
  return instance
}

/**
 * Create deposit address
 * @param {*} payload (contains form data and encrypted Address details)
 */
function createDepositAddress(payload: CreateDepositAddressPayload) {
  const url = '/v1/businessAccount/wallets/addresses/deposit'
  return instance.post(url, payload)
}

/**
 * Get deposit addresses
 * @param {String} walletId
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 */
function getDepositAddresses() {
  const url = '/v1/businessAccount/wallets/addresses/deposit'

  return instance.get(url)
}

/**
 * Create deposit address
 * @param {*} payload (contains form data and encrypted Address details)
 */
function createRecipientAddress(payload: CreateRecipientAddressPayload) {
  const url = '/v1/businessAccount/wallets/addresses/recipient'
  return instance.post(url, payload)
}

/**
 * Get deposit addresses
 */
function getRecipientAddresses() {
  const url = '/v1/businessAccount/wallets/addresses/recipient'

  return instance.get(url)
}

export default {
  getInstance,
  createDepositAddress,
  getDepositAddresses,
  createRecipientAddress,
  getRecipientAddresses,
}
