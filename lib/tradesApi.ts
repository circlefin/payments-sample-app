import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

export interface CreateQuotePayload {
  type: string
  from: {
    amount: number
    currency: string
  }
  to: {
    currency: string
  }
}

export interface CreateTradePayload {
  idempotencyKey: string
  quoteId: string
}

const instance = axios.create({
  baseURL: getAPIHostname(),
})

const TRADES_PATH = '/v1/exchange/trades'

const QUOTES_PATH = '/v1/exchange/quotes'

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
 * Create Quote
 */
function createQuote(payload: CreateQuotePayload) {
  return instance.post(QUOTES_PATH, payload)
}

/**
 * Create Trade
 */
function createTrade(payload: CreateTradePayload) {
  return instance.post(TRADES_PATH, payload)
}

/**
 * Get Trades
 */
function getTrades() {
  return instance.get(TRADES_PATH)
}

/**
 * Get Trade
 */
function getTrade(tradeId: string) {
  const url = `${TRADES_PATH}/${tradeId}`

  return instance.get(url)
}

export default {
  getInstance,
  createQuote,
  createTrade,
  getTrades,
  getTrade,
}
