import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

export interface CreateCheckoutSessionPayload {
  amount: {
    amount: string
    currency: string
  }
  successUrl?: string
}

export interface ExtendCheckoutSessionPayload {
  extendTime: number
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
  }
)

/** Returns the axios instance */
function getInstance() {
  return instance
}

/**
 * Create a checkout session
 * @param {*} payload
 */
function createCheckoutSession(payload: CreateCheckoutSessionPayload) {
  const url = '/v1/checkoutSessions'
  return instance.post(url, payload)
}

/**
 * Get checkout sessions
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 */
function getCheckoutSessions(
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

  const url = '/v1/checkoutSessions'

  return instance.get(url, { params: queryParams })
}

/**
 * Expire a checkout session
 * @param checkoutSessionId checkout session id
 * @param payload payload
 */
function extendCheckoutSession(
  checkoutSessionId: string,
  payload: ExtendCheckoutSessionPayload
) {
  const url = `/v1/checkoutSessions/${checkoutSessionId}/extend`
  return instance.post(url, payload)
}

/**
 * Get checkout session by ID
 * @param {String} checkoutSessionId
 */
function getCheckoutSessionById(checkoutSessionId: string) {
  const url = `/v1/checkoutSessions/${checkoutSessionId}`
  return instance.get(url)
}

const nullIfEmpty = (prop: string | undefined) => {
  if (prop === '') {
    return undefined
  }
  return prop
}

export default {
  getInstance,
  getCheckoutSessions,
  getCheckoutSessionById,
  createCheckoutSession,
  extendCheckoutSession,
}
