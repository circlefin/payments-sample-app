import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

interface MetaData {
  session: {
    sessionId: string
    ipAddress: string
  }
}

export interface MarketplaceInfo {
  merchantId: string
  merchantWallet: string
  endUserWallet: string
}

export interface CreateMarketplacePaymentPayload {
  refId: string
  amount: {
    amount: string
    currency: string
  }
  verificationMethod: string
  source: {
    id: string
    type: string
  }
  keyId: string
  encryptedData: string
  metadata: MetaData
  marketplaceInfo: MarketplaceInfo
}

export interface RefundPaymentPayload {
  refId: string
  amount: {
    amount: string
    currency: string
  }
}

const instance = axios.create({
  baseURL: getAPIHostname()
})

/**
 * Global error handler:
 * Intercepts all axios reponses and maps
 * to errorHandler object
 */
instance.interceptors.response.use(
  function(response) {
    if (get(response, 'data.data')) {
      return response.data.data
    }
    return response
  },
  function(error) {
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
 * Create payment
 * @param {*} payload (contains form data and encrypted payment details)
 */
function createPayment(payload: CreateMarketplacePaymentPayload) {
  const url = `/v1/marketplace/payments`
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
    merchantId: nullIfEmpty(merchantId)
  }

  const url = `/v1/marketplace/payments`

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
  const url = `/v1/marketplace/merchants`
  return instance.get(url)
}

/**
 * Create wallet
 */
function createWallet() {
  const url = `/v1/wallets`
  return instance.post(url)
}

export default {
  getInstance,
  getPayments,
  getPaymentById,
  refundPayment,
  cancelPayment,
  createPayment,
  getMerchants,
  createWallet
}
