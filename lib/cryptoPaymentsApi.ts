import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

interface ProtocolMetadata {
  type: string
  metaTxNonce: string
}

export interface TransferWithAuthorizationMetadata extends ProtocolMetadata {
  signatureValidAfter: string
  signatureValidBefore: string
  rawSignature: string
}

export interface CreateCryptoPaymentPayload {
  idempotencyKey: string
  paymentIntentId: string
  amount: {
    amount: string
    currency: string
  }
  source: {
    type: string
    address: string
  }
  destination: {
    address: string
    chain: string
  }
  protocolMetadata: TransferWithAuthorizationMetadata
  quoteId: string
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
 * Create crypto payment
 * @param {*} payload
 */
function createCryptoPayment(payload: CreateCryptoPaymentPayload) {
  const url = '/v1/payments/crypto'
  return instance.post(url, payload)
}

export default {
  getInstance,
  createCryptoPayment,
}
