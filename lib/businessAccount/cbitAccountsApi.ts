import axios from 'axios'
import get from 'lodash/get'
import { getAPIHostname } from '../apiTarget'

export interface CreateCbitAccountPayload {
  idempotencyKey: string
  walletAddress: string
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
 * Create cbit business account
 * @param {*} payload (contains form data)
 */
function createCbitBusinessAccount(payload: CreateCbitAccountPayload) {
  const url = '/v1/businessAccount/banks/cbit'
  return instance.post(url, payload)
}

/**
 * Get cbit business accounts
 */
function getCbitBusinessAccounts() {
  const url = '/v1/businessAccount/banks/cbit'
  return instance.get(url)
}

/**
 * Get cbit business account by id
 * @param {String} accountId
 */
function getCbitBusinessAccountById(accountId: string) {
  const url = `/v1/businessAccount/banks/cbit/${accountId}`
  return instance.get(url)
}

/**
 * Get cbit business account instructions
 * @param {String} accountId
 */
function getCbitBusinessAccountInstructions(accountId: string) {
  const url = `v1/businessAccount/banks/cbit/${accountId}/instructions`
  return instance.get(url)
}

export default {
  getInstance,
  createCbitBusinessAccount,
  getCbitBusinessAccounts,
  getCbitBusinessAccountById,
  getCbitBusinessAccountInstructions,
}
