import get from 'lodash/get'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

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

/** Returns the axios instance */
function getInstance() {
  return instance
}

/**
 * Create a wallet
 * @param {String} idempotencyKey
 * @param {String} description
 */
function getMasterWallet() {
  const url = '/v1/configuration'
  return instance.get(url)
}

/**
 * Convert digital wallets token
 * @param {String} type
 * @param {Object} tokenData
 * @param {UUID} idempotencyKey
 */
function convertToken(type: string, tokenData: Object) {
  const url = '/v1/paymentTokens'
  const payload = {
    type,
    tokenData,
    idempotencyKey: uuidv4(),
  }
  const config = {
    headers: { 'Access-Control-Allow-Origin': '*' },
  }
  return instance.post(url, payload, config)
}

export default {
  getInstance,
  getMasterWallet,
  convertToken,
}
