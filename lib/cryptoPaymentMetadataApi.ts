import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

const instance = axios.create({
  baseURL: getAPIHostname(),
})

/**
 * Global error handler:
 * Intercepts all axios responses and maps
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
 * Get supported currency and blockchain combinations
 */
function getSupportedCurrencyAndBlockchainCombinations() {
  const url = '/v1/paymentIntents/metadata/supportedCurrencies'
  return instance.get(url)
}

export default {
  getInstance,
  getSupportedCurrencyAndBlockchainCombinations,
}
