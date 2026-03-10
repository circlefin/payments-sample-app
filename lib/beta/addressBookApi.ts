import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from '../apiTarget'

export interface CreateRecipientPayload {
  idempotencyKey: string
  chain: string
  address: string
  addressTag?: string
  metadata: {
    email: string
    bns: string
    nickname: string
  }
  identity?: {
    type: string
    firstName?: string
    lastName?: string
    businessName?: string
  }
  walletId?: string
  ownership?: {
    type: string
    custody: {
      type: string
      vaspId?: string
    }
  }
}

export interface PatchRecipientPayload {
  metadata: {
    email: string
    bns: string
    nickname: string
  }
}

/**
 * Global error handler:
 * Intercepts all axios reponses and maps
 * to errorHandler object
 */
const instance = axios.create({
  baseURL: getAPIHostname(),
})

instance.interceptors.response.use(
  function (response) {
    if (get(response, 'data.data')) {
      return response.data.data
    }
    if (response.data !== undefined) {
      return response.data
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
 * Create Recipient
 * @param {*} payload
 */
function createRecipient(payload: CreateRecipientPayload) {
  const url = '/v1/addressBook/recipients'
  return instance.post(url, payload)
}

/**
 * Get Recipient
 * @param {String} recipientId
 * @param {String} walletId
 */
function getRecipientById(recipientId: string, walletId?: string) {
  const url = `/v1/addressBook/recipients/${recipientId}`
  const params = { walletId: nullIfEmpty(walletId) }
  return instance.get(url, { params })
}

function patchRecipient(recipientId: string, payload: PatchRecipientPayload) {
  const url = `/v1/addressBook/recipients/${recipientId}`
  return instance.patch(url, payload)
}

function deleteRecipient(recipientId: string) {
  const url = `/v1/addressBook/recipients/${recipientId}`
  return instance.delete(url)
}

/**
 * Get Recipients
 * @param address
 * @param chain
 * @param email
 * @param status
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 * @param {String} walletId
 */
function getRecipients(
  address: string,
  chain: string,
  email: string,
  status: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string,
  walletId?: string,
) {
  const queryParams = {
    address: nullIfEmpty(address),
    chain: nullIfEmpty(chain),
    email: nullIfEmpty(email),
    status: nullIfEmpty(status),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
    walletId: nullIfEmpty(walletId),
  }

  const url = '/v1/addressBook/recipients'

  return instance.get(url, { params: queryParams })
}

/**
 * Get VASPs
 */
function getVasps() {
  const url = '/v1/addressBook/vasps'
  return instance.get(url)
}

export default {
  getInstance,
  getRecipients,
  getRecipientById,
  createRecipient,
  patchRecipient,
  deleteRecipient,
  getVasps,
}
