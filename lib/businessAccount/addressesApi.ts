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

import { getAPIHostname } from '../apiTarget'

export interface CreateDepositAddressPayload {
  idempotencyKey: string
  currency: string
  chain: string
}

export interface CreateRecipientAddressPayload {
  idempotencyKey: string
  address: string
  addressTag?: string
  chain: string
  currency?: string
  description: string
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
 * Create deposit address
 * @param {*} payload (contains form data and encrypted Address details)
 */
function createDepositAddress(payload: CreateDepositAddressPayload) {
  const url = '/v1/businessAccount/wallets/addresses/deposit'
  return instance.post(url, payload)
}

/**
 * Get deposit addresses
 */
function getDepositAddresses() {
  const url = '/v1/businessAccount/wallets/addresses/deposit'

  return instance.get(url)
}

/**
 * Create deposit address
 * @param {*} payload (contains form data and encrypted Address details)
 */
function createRecipientAddress(payload: CreateRecipientAddressPayload) {
  const url = '/v1/businessAccount/wallets/addresses/recipient'
  payload.currency = nullIfEmpty(payload.currency)
  return instance.post(url, payload)
}

/**
 * Get deposit addresses
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 */
function getRecipientAddresses(
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
  const url = '/v1/businessAccount/wallets/addresses/recipient'

  return instance.get(url, { params: queryParams })
}

export default {
  getInstance,
  createDepositAddress,
  getDepositAddresses,
  createRecipientAddress,
  getRecipientAddresses,
}
