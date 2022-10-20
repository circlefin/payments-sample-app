import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from '../apiTarget'

export interface CreatePayoutPayload {
  idempotencyKey: string
  source?: {
    id: string
    type: string
  }
  destination: {
    id: string
    type: string
  }
  amount: {
    amount: string
    currency: string
  }
  toAmount?: {
    currency: string
  }
  metadata?: {
    beneficiaryEmail: string
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
 * Get payouts
 * @param {String} sourceWalletId
 * @param {String} destination
 * @param {String} destinationType
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 */
function getPayouts(
  sourceWalletId: string,
  destination: string,
  destinationType: string,
  status: string,
  sourceCurrency: string,
  destinationCurrency: string,
  chain: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string
) {
  const queryParams = {
    sourceWalletId: nullIfEmpty(sourceWalletId),
    destination: nullIfEmpty(destination),
    type: nullIfEmpty(destinationType),
    status: nullIfEmpty(status),
    sourceCurrency: nullIfEmpty(sourceCurrency),
    destinationCurrency: nullIfEmpty(destinationCurrency),
    chain: nullIfEmpty(chain),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }

  const url = '/v1/beta/payouts'

  return instance.get(url, { params: queryParams })
}

/**
 * Get Payout
 * @param {String} payoutId
 */
function getPayoutById(payoutId: string) {
  const url = `/v1/beta/payouts/${payoutId}`

  return instance.get(url)
}

/**
 * Create Payout
 * @param {*} payload
 */
function createPayout(payload: CreatePayoutPayload) {
  const url = '/v1/beta/payouts'
  return instance.post(url, payload)
}

export default {
  getInstance,
  getPayouts,
  getPayoutById,
  createPayout,
}
