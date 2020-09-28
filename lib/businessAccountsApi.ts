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

export interface BlockchainDestination {
  type: string
  address: string
  chain: string
}

export interface AddressDestination {
  type: string
  addressId: string
}

export interface Amount {
  amount: string
  currency: string
}

export interface CreateBankAccountPayload {
  idempotencyKey: string
  beneficiaryName: string
  accountNumber: string
  routingNumber: string
  billingDetails: BillingDetails
  bankAddress: BankAddress
}

export interface CreateTransferPayload {
  idempotencyKey: string
  destination: BlockchainDestination | AddressDestination
  amount: Amount
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

/**
 * Create Transfer
 * @param {*} payload (contains form data and encrypted transfer details)
 */
function createTransfer(payload: CreateTransferPayload) {
  const url = '/v1/businessAccount/transfers'
  return instance.post(url, payload)
}

/**
 * Get transfers
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 */
function getTransfers(
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string
) {
  const queryParams = {
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }

  const url = '/v1/businessAccount/transfers'

  return instance.get(url, { params: queryParams })
}

/**
 * Get Transfer
 * @param {String} transferId
 */
function getTransferById(transferId: string) {
  const url = `/v1/businessAccounttransfers/${transferId}`

  return instance.get(url)
}

export default {
  getInstance,
  createBankAccount,
  getBankAccounts,
  getBankAccountById,
  createTransfer,
  getTransfers,
  getTransferById,
}
