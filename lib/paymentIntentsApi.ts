import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

interface PaymentMethod {
  type: string
  chain: string
}

export interface CreatePaymentIntentPayload {
  idempotencyKey: string
  amount: {
    amount: string
    currency: string
  }
  settlementCurrency: string
  paymentMethods: Array<PaymentMethod>
  expiresOn: string
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
 * Create payment intent
 * @param {*} payload
 */
function createPaymentIntent(payload: CreatePaymentIntentPayload) {
  const url = '/v1/paymentIntents'
  return instance.post(url, payload)
}

/**
 * Expire payment intent
 * @param {String} paymentIntentId
 */
function expirePaymentIntent(paymentIntentId: string) {
  const url = `/v1/paymentIntents/${paymentIntentId}/expire`
  return instance.post(url, null)
}

/**
 * Get payment intent by ID
 * @param {String} paymentIntentId
 */
function getPaymentIntentById(paymentIntentId: string) {
  const url = `/v1/paymentIntents/${paymentIntentId}`
  return instance.get(url)
}

/**
 * Get payment intents
 * @param {String} status
 * @param {String} context
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 */
function getPaymentIntents(
  status: string,
  context: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string
) {
  const queryParams = {
    status: nullIfEmpty(status),
    context: nullIfEmpty(context),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }
  const url = '/v1/paymentIntents'
  return instance.get(url, { params: queryParams })
}

export default {
  getInstance,
  getPaymentIntents,
  getPaymentIntentById,
  createPaymentIntent,
  expirePaymentIntent,
}
