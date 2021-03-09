import { get } from 'lodash'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

interface MetaData {
  email?: string
  phoneNumber?: string
  sessionId: string
  ipAddress: string
}

export interface CreateACHAccountPayload {
  idempotencyKey: string
  plaidProcessorToken: string
  billingDetails: {
    name: string
    city: string
    country: string
    line1: string
    line2: string
    district: string
    postalCode: string
  }
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
 * Create ACH Account
 * @param {*} payload (contains form data)
 */
function createACHAccount(payload: CreateACHAccountPayload) {
  const url = '/v1/banks/ach'
  if (payload.metadata) {
    payload.metadata.phoneNumber = nullIfEmpty(payload.metadata.phoneNumber)
    payload.metadata.email = nullIfEmpty(payload.metadata.email)
  }
  return instance.post(url, payload)
}

/**
 * Get ACH Account By Id
 * @param {String} accountId
 */
function getACHAccountById(accountId: string) {
  const url = `/v1/banks/ach/${accountId}`

  return instance.get(url)
}

export default {
  getInstance,
  createACHAccount,
  getACHAccountById,
}
