import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

export interface CreateQuotePayload {
  type: string
  from: {
    amount?: number
    currency: string
  }
  to: {
    amount?: number
    currency: string
  }
}

export interface CreateTradePayload {
  idempotencyKey: string
  quoteId: string
  fullfill: boolean
}

const instance = axios.create({
  baseURL: getAPIHostname(),
})

const TRADES_PATH = '/v1/exchange/trades'

const SETTLEMENTS_PATH = `${TRADES_PATH}/settlements`

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
  if (!payload.from.amount) {
    delete payload.from.amount
  }
  if (!payload.to.amount) {
    delete payload.to.amount
  }

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

/**
 * Get Settlements
 */
function getSettlements(
  type: string,
  status: string,
  currency: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string
) {
  const params = {
    type: nullIfEmpty(type),
    status: nullIfEmpty(status),
    currency: nullIfEmpty(currency),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }
  return instance.get(SETTLEMENTS_PATH, { params })
}

/**
 * Get Settlement
 */
function getSettlement(settlementId: string) {
  return instance.get(`${SETTLEMENTS_PATH}/${settlementId}`)
}

/**
 * Get Settlement By Reference
 */
function getSettlementByReference(reference: string) {
  return instance.get(`${SETTLEMENTS_PATH}/reference/${reference}`)
}

/**
 * Get Settlement Instructions
 */
function getSettlementInstructions(currency: string) {
  return instance.get(`${SETTLEMENTS_PATH}/instructions/${currency}`)
}

const nullIfEmpty = (prop: string | undefined) => {
  if (prop === '') {
    return undefined
  }
  return prop
}

export default {
  getInstance,
  createQuote,
  createTrade,
  getTrades,
  getTrade,
  getSettlements,
  getSettlement,
  getSettlementByReference,
  getSettlementInstructions,
}
