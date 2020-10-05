import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from '../apiTarget'

export interface CreatePayoutPayload {
  idempotencyKey: string
  destination: {
    id: string
    type: string
  }
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
 * Create Transfer
 * @param {*} payload (contains form data and encrypted transfer details)
 */
function createPayout(payload: CreatePayoutPayload) {
  const url = '/v1/businessAccount/payouts'
  return instance.post(url, payload)
}

/**
 * Get Transfer
 * @param {String} payoutId
 */
function getPayoutById(payoutId: string) {
  const url = `/v1/businessAccount/payouts/${payoutId}`

  return instance.get(url)
}

export default {
  getInstance,
  createPayout,
  getPayoutById,
}
