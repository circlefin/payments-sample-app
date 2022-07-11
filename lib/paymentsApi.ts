import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

interface MetaData {
  email: string
  phoneNumber?: string
  sessionId: string
  ipAddress: string
}

export interface BasePaymentPayload {
  idempotencyKey: string
  amount: {
    amount: string
    currency: string
  }
  source: {
    id: string
    type: string
  }
  description: string
  channel: string
  metadata: MetaData
}

export interface CreateCardPaymentPayload extends BasePaymentPayload {
  verification?: string
  autoCapture?: boolean
  verificationSuccessUrl?: string
  verificationFailureUrl?: string
  keyId?: string
  encryptedData?: string
}

export interface RefundPaymentPayload {
  idempotencyKey: string
  amount: {
    amount: string
    currency: string
  }
  reason: string | undefined
}

export interface CapturePaymentPayload {
  idempotencyKey: string
  amount: {
    amount: string
    currency: string
  }
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
 * Returns a public key used to encryption
 *
 * @returns Promise<PublicKey> {"keyId": "key1", "publicKey": "LS0tLS1CRUdJTiBQR1A..." }
 */
function getPCIPublicKey() {
  const url = '/v1/encryption/public'

  return instance.get(url)
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
 * Create payment
 * @param {*} payload (contains form data and encrypted payment details)
 */
function createPayment(payload: BasePaymentPayload) {
  const url = '/v1/payments'
  if (payload.metadata) {
    payload.metadata.phoneNumber = nullIfEmpty(payload.metadata.phoneNumber)
  }
  return instance.post(url, payload)
}

/**
 * Get payments
 * @param {String} settlementId
 * @param {String} paymentIntentId
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 */
function getPayments(
  settlementId: string,
  paymentIntentId: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string
) {
  const queryParams = {
    settlementId: nullIfEmpty(settlementId),
    paymentIntentId: nullIfEmpty(paymentIntentId),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }

  const url = '/v1/payments'

  return instance.get(url, { params: queryParams })
}

/**
 * Get a payment
 * @param {String} id
 */
function getPaymentById(id: string) {
  const url = `/v1/payments/${id}`

  return instance.get(url)
}

/**
 * Refund a payment
 * @param {String} id
 */
function refundPayment(id: string, payload: RefundPaymentPayload) {
  const url = `/v1/payments/${id}/refund`
  payload.reason = nullIfEmpty(payload.reason)
  return instance.post(url, payload)
}

/**
 * Capture a payment
 * @param {String} id
 */
function capturePayment(id: string, payload: CapturePaymentPayload) {
  const url = `/v1/payments/${id}/capture`
  return instance.post(url, payload)
}

/**
 * Get balance
 */
function getBalance() {
  const url = '/v1/balances'
  return instance.get(url)
}

/**
 * Get reversals
 * @param {String} status
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 */
function getReversals(
  status: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string
) {
  const queryParams = {
    status: nullIfEmpty(status),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }

  const url = '/v1/reversals'

  return instance.get(url, { params: queryParams })
}

export default {
  getInstance,
  cancelPayment,
  createPayment,
  getPayments,
  getPaymentById,
  getPCIPublicKey,
  refundPayment,
  capturePayment,
  getBalance,
  getReversals,
}
