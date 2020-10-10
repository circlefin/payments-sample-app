import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from '../apiTarget'

export interface CreateWireAccountPayload {
  idempotencyKey: string
  beneficiaryName: string
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
 * Create wire bank account
 * @param {*} payload (contains form data)
 */
function createBankAccount(payload: CreateWireAccountPayload) {
  const url = '/v1/businessAccount/banks/wires'
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
 * Get wire bank accounts
 */
function getBankAccounts() {
  const url = '/v1/businessAccount/banks/wires'
  return instance.get(url)
}

/**
 * Get wire bank account by id
 * @param {String} bankId
 */
function getBankAccountById(bankId: string) {
  const url = `/v1/businessAccount/banks/wires/${bankId}`

  return instance.get(url)
}

/**
 * Get wire bank account instructions
 * @param {String} bankId
 */
function getBankAccountInstructions(bankId: string) {
  const url = `/v1/businessAccount/banks/wires/${bankId}/instructions`

  return instance.get(url)
}

export default {
  getInstance,
  createBankAccount,
  getBankAccounts,
  getBankAccountById,
  getBankAccountInstructions,
}
