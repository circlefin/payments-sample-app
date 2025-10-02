import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

export interface CreateStableFXQuotePayload {
  from: {
    amount?: number
    currency: string
  }
  to: {
    amount?: number
    currency: string
  }
}

export interface CreateStableFXTradePayload {
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
  recipient?: string
  deadline: number
  nonce: number
  fee: number
  consideration: Consideration
}

export interface CreatePiFXSignaturePayload {
  tradeId: string
  type: string
  address: string
  details: PiFXTraderDetails
  signature: string
}

export interface FundingPresignPayload {
  contractTradeIds: string[]
  fundingMode: 'gross' | 'net'
  traderType: 'maker' | 'taker'
}

export interface SingleTradeWitnessPermit2 {
  permitted: {
    token: string
    amount: number
  }
  spender: string
  nonce: number
  deadline: number
  witness: {
    id: number
  }
}

export interface BatchTradeWitnessPermit2 {
  permitted: Array<{
    token: string
    amount: number
  }>
  spender: string
  nonce: number
  deadline: number
  witness: {
    ids: number[]
  }
}

export interface StableFXFundPayload {
  type: 'maker' | 'taker'
  signature: string
  fundingMode: 'gross' | 'net'
  permit2: SingleTradeWitnessPermit2 | BatchTradeWitnessPermit2
}

const instance = axios.create({
  baseURL: getAPIHostname(),
})

const STABLEFX_TRADES_PATH = '/v1/exchange/stablefx/trades'
const STABLEFX_QUOTES_PATH = '/v1/exchange/stablefx/quotes'
const STABLEFX_SIGNATURES_PATH = '/v1/exchange/stablefx/signatures'
const STABLEFX_FUND_PATH = '/v1/exchange/stablefx/fund'

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

const nullIfEmpty = (prop: string | undefined) => {
  if (prop === '') {
    return undefined
  }
  return prop
}

/** Returns the axios instance */
function getInstance() {
  return instance
}

/**
 * Create StableFX Quote
 */
function createQuote(payload: CreateStableFXQuotePayload) {
  if (!payload.from.amount) {
    delete payload.from.amount
  }
  if (!payload.to.amount) {
    delete payload.to.amount
  }

  return instance.post(STABLEFX_QUOTES_PATH, payload)
}

/**
 * Create StableFX Trade
 */
function createTrade(payload: CreateStableFXTradePayload) {
  return instance.post(STABLEFX_TRADES_PATH, payload)
}

/**
 * Get StableFX Trades
 */
function getTrades(
  startCreateDateInclusive?: string,
  endCreateDateInclusive?: string,
  statuses?: string,
  type?: string,
  pageAfter?: string,
  pageBefore?: string,
  pageSize?: string,
) {
  const queryParams = {
    startCreateDateInclusive: nullIfEmpty(startCreateDateInclusive),
    endCreateDateInclusive: nullIfEmpty(endCreateDateInclusive),
    status: nullIfEmpty(statuses),
    type: nullIfEmpty(type),
    pageAfter: nullIfEmpty(pageAfter),
    pageBefore: nullIfEmpty(pageBefore),
    pageSize: nullIfEmpty(pageSize),
  }

  return instance.get(STABLEFX_TRADES_PATH, { params: queryParams })
}

/**
 * Get StableFX Trade
 */
function getTrade(tradeId: string, type?: string) {
  const url = `${STABLEFX_TRADES_PATH}/${tradeId}`
  const queryParams = {
    type: nullIfEmpty(type),
  }

  return instance.get(url, { params: queryParams })
}

/**
 * Register StableFX Signature
 */
function registerSignature(payload: CreatePiFXSignaturePayload) {
  return instance.post(STABLEFX_SIGNATURES_PATH, payload)
}

/**
 * Get presign data for signing
 */
function getPresignData(
  type: string,
  tradeId: string,
  recipientAddress?: string,
) {
  const url = `/v1/exchange/stablefx/signatures/presign/${type}/${tradeId}`
  const queryParams = recipientAddress ? { recipientAddress } : {}

  return instance.get(url, { params: queryParams })
}

/**
 * Get funding presign data
 */
function getFundingPresignData(payload: FundingPresignPayload) {
  const url = '/v1/exchange/stablefx/signatures/funding/presign'
  return instance.post(url, payload)
}

/**
 * Fund StableFX Trade
 * Note: 'net' funding mode is only available for makers
 */
function fund(payload: StableFXFundPayload) {
  // Validate that net funding mode is only used with makers
  if (payload.fundingMode === 'net' && payload.type !== 'maker') {
    throw new Error('Net funding mode is only available for makers')
  }

  return instance.post(STABLEFX_FUND_PATH, payload)
}

export default {
  getInstance,
  createQuote,
  createTrade,
  getTrades,
  getTrade,
  registerSignature,
  getPresignData,
  getFundingPresignData,
  fund,
}
