import { get } from 'lodash'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

import { getAPIHostname } from './apiTarget'

interface MetaData {
  email: string
  phoneNumber?: string
  sessionId: string
  ipAddress: string
}

export interface MarketplaceInfo {
  merchantId: string
  merchantWalletId: string
  walletId: string
}

export interface CreateMarketplacePaymentPayload {
  idempotencyKey: string
  amount: {
    amount: string
    currency: string
  }
  verification: string
  source: {
    id: string
    type: string
  }
  keyId?: string
  encryptedData?: string
  metadata: MetaData
  marketplaceInfo: MarketplaceInfo
}

export interface RefundPaymentPayload {
  idempotencyKey: string
  amount: {
    amount: string
    currency: string
  }
  reason: string | undefined
}

export interface CreateWallet {
  idempotencyKey: string
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
 * Create payment
 * @param {*} payload (contains form data and encrypted payment details)
 */
function createPayment(payload: CreateMarketplacePaymentPayload) {
  const url = '/v1/marketplace/payments'
  if (payload.metadata) {
    payload.metadata.phoneNumber = nullIfEmpty(payload.metadata.phoneNumber)
  }
  return instance.post(url, payload)
}

/**
 * Get payments
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 * @param {String} merchantId
 */
function getPayments(
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string,
  merchantId: string
) {
  const nullIfEmpty = (prop: string) => {
    if (prop === '') {
      return null
    }
    return prop
  }

  const queryParams = {
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
    merchantId: nullIfEmpty(merchantId),
  }

  const url = '/v1/marketplace/payments'

  return instance.get(url, { params: queryParams })
}

/**
 * Get a payment
 * @param {String} id
 */
function getPaymentById(id: string) {
  const url = `/v1/marketplace/payments/${id}`

  return instance.get(url)
}

/**
 * Refund a payment
 * @param {String} id
 */
function refundPayment(id: string, payload: RefundPaymentPayload) {
  const url = `/v1/payments/${id}/refund/`
  payload.reason = nullIfEmpty(payload.reason)
  return instance.post(url, payload)
}

/**
 * Cancel a payment
 * @param {String} id
 */
function cancelPayment(id: string, payload: any) {
  const url = `/v1/payments/${id}/cancel`

  return instance.post(url, payload)
}

/**
 * Get merchants
 */
function getMerchants() {
  const url = '/v1/marketplace/merchants'
  return instance.get(url)
}

/**
 * Create wallet
 */
function createWallet() {
  const url = '/v1/wallets'
  const payload = {
    idempotencyKey: uuidv4(),
  }
  return instance.post(url, payload)
}

export default {
  getInstance,
  getPayments,
  getPaymentById,
  refundPayment,
  cancelPayment,
  createPayment,
  getMerchants,
  createWallet,
}
