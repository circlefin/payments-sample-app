import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

export interface CreateSepaAccountPayload {
  idempotencyKey: string
  iban: string
  billingDetails: {
    name: string
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
 * Create Sepa Account
 * @param {*} payload (contains form data)
 */
function createSepaAccount(payload: CreateSepaAccountPayload) {
  const url = '/v1/banks/sepa'
  return instance.post(url, payload)
}

/**
 * Get Sepa Account By Id
 * @param {String} accountId
 */
function getSepaAccountById(accountId: string) {
  const url = `/v1/banks/sepa/${accountId}`

  return instance.get(url)
}

/**
 * Get Sepa Account Instructions
 * @param {String} accountId
 */
function getSepaAccountInstructions(accountId: string) {
  const url = `/v1/banks/sepa/${accountId}/instructions`

  return instance.get(url)
}

export default {
  getInstance,
  createSepaAccount,
  getSepaAccountById,
  getSepaAccountInstructions,
}
