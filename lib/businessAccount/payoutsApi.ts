import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from '../apiTarget'

export interface CreatePayoutPayload {
  idempotencyKey: string
  destination: {
    id: string
    type: string
  }
  amount: {
    amount: string
    currency: string
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
 * Create Payout
 * @param {*} payload (contains form data and encrypted transfer details)
 */
function createPayout(payload: CreatePayoutPayload) {
  const url = '/v1/businessAccount/payouts'
  return instance.post(url, payload)
}

/**
 * Get Payout
 * @param {String} payoutId
 */
function getPayoutById(payoutId: string) {
  const url = `/v1/businessAccount/payouts/${payoutId}`

  return instance.get(url)
}

/**
 * Get Payouts
 * @param {String} destination
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 */
function getPayouts(
  destination: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string
) {
  const queryParams = {
    destination: nullIfEmpty(destination),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }
  const url = '/v1/businessAccount/payouts'
  return instance.get(url, { params: queryParams })
}

export default {
  getInstance,
  createPayout,
  getPayoutById,
  getPayouts,
}
