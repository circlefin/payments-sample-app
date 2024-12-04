import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

export interface CreateMockPushPaymentPayload {
  trackingRef: string
  memo: string
  beneficiaryBank: {
    accountNumber: string
  }
  amount: {
    amount: string
    currency: string
  }
  rail: string
}

export interface CreateMockPixPushPaymentPayload {
  trackingRef: string
  accountNumber: string
  amount: {
    amount: string
  }
}

export interface CreateMockChargebackPayload {
  paymentId: string
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

/** Returns the axios instance */
function getInstance() {
  return instance
}

/**
 * Trigger arrival of an incoming wire
 * @param {*} payload
 */
function createMockWirePayment(payload: CreateMockPushPaymentPayload) {
  const url = '/v1/mocks/payments/wire'
  return instance.post(url, payload)
}

/**
 * Trigger pix payment
 */
function createMockPixPyament(payload: CreateMockPixPushPaymentPayload) {
  const url = '/v1/mocks/payments/pix'
  return instance.post(url, payload)
}

/**
 * Create a mock chargeback
 * @param {*} payload
 */
function createMockChargeback(payload: CreateMockChargebackPayload) {
  const url = '/v1/mocks/cards/chargebacks'
  return instance.post(url, payload)
}

export default {
  getInstance,
  createMockWirePayment,
  createMockChargeback,
  createMockPixPyament,
}
