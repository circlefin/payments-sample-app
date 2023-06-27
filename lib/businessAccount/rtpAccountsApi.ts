import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from '../apiTarget'

export interface CreateRTPAccountPayload {
  idempotencyKey: string
  accountNumber?: string
  routingNumber?: string
  billingDetails: {
    name?: string
    city?: string
    country?: string
    line1?: string
    line2?: string
    district?: string
    postalCode?: string
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
 * Create RTP bank account
 * @param {*} payload (contains form data)
 */
function createRTPAccount(payload: CreateRTPAccountPayload) {
  const url = '/v1/businessAccount/banks/rtp'
  payload.accountNumber = nullIfEmpty(payload.accountNumber)
  payload.routingNumber = nullIfEmpty(payload.routingNumber)
  payload.billingDetails.name = nullIfEmpty(payload.billingDetails.name)
  payload.billingDetails.city = nullIfEmpty(payload.billingDetails.city)
  payload.billingDetails.line1 = nullIfEmpty(payload.billingDetails.line1)
  payload.billingDetails.line2 = nullIfEmpty(payload.billingDetails.line2)
  payload.billingDetails.district = nullIfEmpty(payload.billingDetails.district)
  payload.billingDetails.postalCode = nullIfEmpty(
    payload.billingDetails.postalCode
  )
  return instance.post(url, payload)
}

/**
 * Get RTP bank accounts
 */
function getRTPAccounts() {
  const url = '/v1/businessAccount/banks/rtp'
  return instance.get(url)
}

/**
 * Get RTP bank account by id
 * @param {String} bankId
 */
function getRTPAccountById(bankId: string) {
  const url = `/v1/businessAccount/banks/rtp/${bankId}`

  return instance.get(url)
}

/**
 * Get RTP bank account instructions
 * @param {String} bankId
 */
function getRTPAccountInstructions(bankId: string) {
  const url = `/v1/businessAccount/banks/rtp/${bankId}/instructions`

  return instance.get(url)
}

export default {
  getInstance,
  createRTPAccount,
  getRTPAccounts,
  getRTPAccountById,
  getRTPAccountInstructions,
}
