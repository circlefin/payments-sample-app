import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

export interface CreateAccountPayload {
  idempotencyKey: string
  beneficiaryName: string
  bankName: string
  accountNumber: string
  bankIdentifier: string
  billingDetails: {
    name: string
    city: string
    country: string
    line1: string
    line2: string
    district: string
    postalCode: string
  }
  bankAddress: {
    city: string
    country: string
    line1: string
    line2: string
    district: string
    postalCode: string
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

/** Returns the axios instance */
function getInstance() {
  return instance
}

/**
 * Create Account
 * @param {*} payload (contains form data)
 */
function createAccount(payload: CreateAccountPayload) {
  const url = '/v1/wires'
  return instance.post(url, payload)
}

export default {
  getInstance,
  createAccount,
}
