import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

export interface CreateWireAccountPayload {
  idempotencyKey: string
  accountNumber?: string
  routingNumber?: string
  iban?: string
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
    bankName?: string
    city?: string
    country: string
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

/** Returns the axios instance */
function getInstance() {
  return instance
}

const nullIfEmpty = (prop: string | undefined) => {
  if (prop !== undefined && prop.trim() === '') {
    return undefined
  }
  return prop
}

/**
 * Create Wire Account
 * @param {*} payload (contains form data)
 */
function createWireAccount(payload: CreateWireAccountPayload) {
  const url = '/v1/banks/wires'
  payload.accountNumber = nullIfEmpty(payload.accountNumber)
  payload.routingNumber = nullIfEmpty(payload.routingNumber)
  payload.iban = nullIfEmpty(payload.iban)
  payload.bankAddress.bankName = nullIfEmpty(payload.bankAddress.bankName)
  payload.bankAddress.city = nullIfEmpty(payload.bankAddress.city)
  payload.bankAddress.line1 = nullIfEmpty(payload.bankAddress.line1)
  payload.bankAddress.line2 = nullIfEmpty(payload.bankAddress.line2)
  payload.bankAddress.district = nullIfEmpty(payload.bankAddress.district)
  payload.bankAddress.postalCode = nullIfEmpty(payload.bankAddress.postalCode)
  return instance.post(url, payload)
}

/**
 * Get Wire Account By Id
 * @param {String} accountId
 */
function getWireAccountById(accountId: string) {
  const url = `/v1/banks/wires/${accountId}`

  return instance.get(url)
}

/**
 * Get Wire Account Instructions
 * @param {String} accountId
 */
function getWireAccountInstructions(accountId: string) {
  const url = `/v1/banks/wires/${accountId}/instructions`

  return instance.get(url)
}

export default {
  getInstance,
  createWireAccount,
  getWireAccountById,
  getWireAccountInstructions,
}
