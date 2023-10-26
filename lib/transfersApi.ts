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

export interface BlockchainDestination {
  type: string
  address: string
  chain: string
  addressTag?: string
}

export interface WalletDestination {
  type: string
  id: string
}

export interface CreateTransferPayload {
  idempotencyKey: string
  source: {
    type: string
    id: string
  }
  destination: BlockchainDestination | WalletDestination
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
 * Get Transfer
 * @param {String} transferId
 */
function getTransferById(transferId: string) {
  const url = `/v1/transfers/${transferId}`

  return instance.get(url)
}

/**
 * Get transfers
 * @param {String} sourceWalletId
 * @param {String} destinationWalletId
 * @param {String} from
 * @param {String} to
 * @param {String} pageBefore
 * @param {String} pageAfter
 * @param {String} pageSize
 */
function getTransfers(
  walletId: string,
  sourceWalletId: string,
  destinationWalletId: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string
) {
  const queryParams = {
    walletId: nullIfEmpty(walletId),
    sourceWalletId: nullIfEmpty(sourceWalletId),
    destinationWalletId: nullIfEmpty(destinationWalletId),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }

  const url = '/v1/transfers'

  return instance.get(url, { params: queryParams })
}

/**
 * Create Transfer
 * @param {*} payload (contains form data and encrypted transfer details)
 */
function createTransfer(payload: CreateTransferPayload) {
  const url = '/v1/transfers'
  return instance.post(url, payload)
}

export default {
  getInstance,
  getTransfers,
  getTransferById,
  createTransfer,
}
