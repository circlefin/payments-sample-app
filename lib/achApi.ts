import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

export interface CreateACHAccountPayload {
  idempotencyKey: string
  plaidProcessorToken: string
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
 * Create ACH Account
 * @param {*} payload (contains form data)
 */
function createACHAccount(payload: CreateACHAccountPayload) {
  const url = '/v1/banks/ach'
  return instance.post(url, payload)
}

/**
 * NOTE: Unused for now.
 * Get ACH Account By Id
 * @param {String} accountId
 */
function getACHAccountById(accountId: string) {
  const url = `/v1/banks/ach/${accountId}`

  return instance.get(url)
}

export default {
  getInstance,
  createACHAccount,
  getACHAccountById,
}
