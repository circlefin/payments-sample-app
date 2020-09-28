import { get } from 'lodash'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

import { getAPIHostname } from './apiTarget'

interface MetaData {
  email: string
  phoneNumber?: string
  sessionId: string
  ipAddress: string
}

export interface CreateBankAccountPayload {
  idempotencyKey: string
  beneficiaryName: string
  accountNumber: string
  routingNumber: string
  billingDetails: BillingDetails
  bankAddress: BankAddress
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
 * @param {*} payload (contains form data and encrypted payment details)
 */
function createBankAccount(payload: CreateBankAccountPayload) {
  const url = '/v1/businessAccount/banks/wires'
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
function getBankAccountById(bankId: string) {
  const url = `/v1/businessAccount/banks/wires/${bankId}/instructions`

  return instance.get(url)
}
