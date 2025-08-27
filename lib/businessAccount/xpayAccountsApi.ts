import axios from 'axios'
import get from 'lodash/get'
import { getAPIHostname } from '../apiTarget'

export interface CreateXpayAccountPayload {
  idempotencyKey: string
  accountNumber: string
}

const instance = axios.create({
  baseURL: getAPIHostname(),
})

/**
 * Global error handler:
 * Intercepts all axios responses and maps
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
  },
)

/** Returns the axios instance */
function getInstance() {
  return instance
}

/**
 * Create xpay business account
 * @param {*} payload (contains form data)
 */
function createXpayBusinessAccount(payload: CreateXpayAccountPayload) {
  const url = '/v1/businessAccount/banks/xpay'
  return instance.post(url, payload)
}

/**
 * Get xpay business accounts
 */
function getXpayBusinessAccounts() {
  const url = '/v1/businessAccount/banks/xpay'
  return instance.get(url)
}

/**
 * Get xpay business account by id
 * @param {String} accountId
 */
function getXpayBusinessAccountById(accountId: string) {
  const url = `/v1/businessAccount/banks/xpay/${accountId}`
  return instance.get(url)
}

/**
 * Get xpay business account instructions
 * @param {String} accountId
 */
function getXpayBusinessAccountInstructions(accountId: string) {
  const url = `v1/businessAccount/banks/xpay/${accountId}/instructions`
  return instance.get(url)
}

export default {
  getInstance,
  createXpayBusinessAccount,
  getXpayBusinessAccounts,
  getXpayBusinessAccountById,
  getXpayBusinessAccountInstructions,
}
