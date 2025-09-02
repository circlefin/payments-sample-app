import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

export interface CreateCpsQuotePayload {
  from: {
    amount?: number
    currency: string
  }
  to: {
    amount?: number
    currency: string
  }
}

export interface CreateCpsTradePayload {
  idempotencyKey: string
  quoteId: string
}

export interface Consideration {
  quoteId: string
  base: string
  quote: string
  quoteAmount: number
  baseAmount: number
  maturity: number
}

export interface PiFXTraderDetails {
  recipient: string
  deadline: number
  nonce: number
  consideration: Consideration
}

export interface CreatePiFXSignaturePayload {
  tradeId: string
  type: string
  address: string
  details: PiFXTraderDetails
  signature: string
}

const instance = axios.create({
  baseURL: getAPIHostname(),
})

const CPS_TRADES_PATH = '/v1/exchange/cps/trades'
const CPS_QUOTES_PATH = '/v1/exchange/cps/quotes'
const CPS_SIGNATURES_PATH = '/v1/exchange/cps/signatures'

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
  },
)

/** Returns the axios instance */
function getInstance() {
  return instance
}

/**
 * Create CPS Quote
 */
function createQuote(payload: CreateCpsQuotePayload) {
  if (!payload.from.amount) {
    delete payload.from.amount
  }
  if (!payload.to.amount) {
    delete payload.to.amount
  }

  return instance.post(CPS_QUOTES_PATH, payload)
}

/**
 * Create CPS Trade
 */
function createTrade(payload: CreateCpsTradePayload) {
  return instance.post(CPS_TRADES_PATH, payload)
}

/**
 * Get CPS Trades
 */
function getTrades() {
  return instance.get(CPS_TRADES_PATH)
}

/**
 * Get CPS Trade
 */
function getTrade(tradeId: string) {
  const url = `${CPS_TRADES_PATH}/${tradeId}`

  return instance.get(url)
}

/**
 * Register CPS Signature
 */
function registerSignature(payload: CreatePiFXSignaturePayload) {
  return instance.post(CPS_SIGNATURES_PATH, payload)
}

export default {
  getInstance,
  createQuote,
  createTrade,
  getTrades,
  getTrade,
  registerSignature,
}
