import get from 'lodash/get'
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
 * Get Trades
 */
function getTrades() {
  const url = '/v1/exchange/trades'

  return instance.get(url)
}

/**
 * Get Trade
 */
function getTrade(tradeId: string) {
  const url = `/v1/exchange/trades/${tradeId}`

  return instance.get(url)
}

export default {
  getInstance,
  getTrades,
  getTrade,
}
