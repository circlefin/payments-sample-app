import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

export interface CreateMockIncomingWirePayload {
  trackingRefId: string
  amount: {
    amount: string
    currency: string
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
function createMockIncomingWire(payload: CreateMockIncomingWirePayload) {
  const url = 'v1/mocks/payments/incomingWires'
  return instance.post(url, payload)
}

/**
 * Create a mock chargeback
 * @param {*} payload
 */
function createMockChargeback(payload: CreateMockChargebackPayload) {
  const url = 'v1/mocks/cards/chargebacks'
  return instance.post(url, payload)
}


export default {
  getInstance,
  createMockIncomingWire,
  createMockChargeback,
}
