import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from '../apiTarget'

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
 * Get balances
 */
function getBalances() {
  const url = '/v1/businessAccount/balances'

  return instance.get(url)
}

export default {
  getInstance,
  getBalances,
}
