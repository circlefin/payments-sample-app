import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

interface MetaData {
  email: string
  phoneNumber?: string
  sessionId: string
  ipAddress: string
}

export interface CreateMockChargebackPayload {
  idempotencyKey: string
  amount: {
    amount: string
    currency: string
  }
  verification: string
  source: {
    id: string
    type: string
  }
  keyId?: string
  encryptedData?: string
  metadata: MetaData
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
 * Get Settlements
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 */
function getChargebacks(
  merchantId: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string
) {
  const queryParams = {
    merchantId: nullIfEmpty(merchantId),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }

  const url = '/v1/chargebacks'

  return instance.get(url, { params: queryParams })
}

/**
 * Get a settlement
 * @param {String} id
 * @param {String} merchantId
 */
function getChargebackById(id: string, merchantId: string) {
  const url = `/v1/chargebacks/${id}`

  return instance.get(url, {
    params: {
      merchantId: nullIfEmpty(merchantId),
    },
  })
}

/**
 * Create payment
 * @param {*} payload (contains form data and encrypted payment details)
 */
function createMockChargeback(payload: CreateMockChargebackPayload) {
  const url = '/v1/chargebacks'
  if (payload.metadata) {
    payload.metadata.phoneNumber = nullIfEmpty(payload.metadata.phoneNumber)
  }
  return instance.post(url, payload)
}

export default {
  getInstance,
  getChargebacks,
  getChargebackById,
  createMockChargeback,
}
