/**
 * Copyright 2023 Circle Internet Financial, LTD.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from './apiTarget'

interface MetaData {
  email?: string
  phoneNumber?: string
  sessionId: string
  ipAddress: string
}

export interface UpdateCardPayload {
  keyId?: string
  encryptedData?: string
  expMonth?: number | null
  expYear?: number | null
  billingDetails: {
    firstName?: string
    lastName?: string
    line1?: string
    line2?: string
    city?: string
    postalCode?: string
    district?: string
    country?: string
    phone?: string
    email?: string
  }
}

export interface CreateCardPayload {
  idempotencyKey: string
  keyId: string
  encryptedData: string
  billingDetails: {
    name: string
    city: string
    country: string
    line1: string
    line2: string
    district: string
    postalCode: string
  }
  expMonth: number
  expYear: number
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
 * Returns a public key used to encrypt card details
 *
 * @returns Promise<PublicKey> {"keyId": "key1", "publicKey": "LS0tLS1CRUdJTiBQR1A..." }
 */
function getPCIPublicKey() {
  const url = '/v1/encryption/public'

  return instance.get(url)
}

/**
 * Get Card
 * @param {String} cardId
 */
function getCardById(cardId: string) {
  const url = `/v1/cards/${cardId}`

  return instance.get(url)
}

/**
 * Get Cards
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 */
function getCards(pageBefore: string, pageAfter: string, pageSize: string) {
  const queryParams = {
    pageBefore,
    pageAfter,
    pageSize,
  }

  const url = '/v1/cards'

  return instance.get(url, { params: queryParams })
}

/**
 * Create Card
 * @param {*} payload (contains form data and encrypted card details)
 */
function createCard(payload: CreateCardPayload) {
  const url = '/v1/cards'
  if (payload.metadata) {
    payload.metadata.phoneNumber = nullIfEmpty(payload.metadata.phoneNumber)
  }
  return instance.post(url, payload)
}

/**
 * Update card
 *
 * @param {String} cardId
 * @returns Promise
 */
function updateCard(cardId: string, payload: UpdateCardPayload) {
  return instance.put(`/v1/cards/${cardId}`, payload)
}

export default {
  getInstance,
  getPCIPublicKey,
  getCards,
  getCardById,
  createCard,
  updateCard,
}
