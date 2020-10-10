import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from '../apiTarget'

export interface BlockchainDestination {
  type: string
  addressId: string
}

export interface Amount {
  amount: string
  currency: string
}

export interface CreateTransferPayload {
  idempotencyKey: string
  destination: BlockchainDestination
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
  const url = `/v1/businessAccount/transfers/${transferId}`

  return instance.get(url)
}

export default {
  getInstance,
  createTransfer,
  getTransfers,
  getTransferById,
}
