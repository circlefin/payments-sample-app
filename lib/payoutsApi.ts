import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

export interface CreatePayoutPayload {
  idempotencyKey: string
  destinationAccount: string
  amount: {
    amount: string
    currency: string
  }
  metadata: {
    beneficaryEmail: string
    beneficaryPhoneNumber: string | undefined
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
 * Get Payout
 * @param {String} payoutId
 */
function getPayoutById(payoutId: string) {
  const url = `/v1/payouts/${payoutId}`

  return instance.get(url)
}

/**
 * Create Payout
 * @param {*} payload
 */
function createPayout(payload: CreatePayoutPayload) {
  const url = '/v1/payouts'
  payload.metadata.beneficaryPhoneNumber = nullIfEmpty(
    payload.metadata.beneficaryPhoneNumber
  )
  return instance.post(url, payload)
}

export default {
  getInstance,
  getPayoutById,
  createPayout,
}
