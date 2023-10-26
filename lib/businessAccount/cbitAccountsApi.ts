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

import axios from 'axios'
import get from 'lodash/get'
import { getAPIHostname } from '../apiTarget'

export interface CreateCbitAccountPayload {
  idempotencyKey: string
  walletAddress: string
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
 * Create cbit business account
 * @param {*} payload (contains form data)
 */
function createCbitBusinessAccount(payload: CreateCbitAccountPayload) {
  const url = '/v1/businessAccount/banks/cbit'
  return instance.post(url, payload)
}

/**
 * Get cbit business accounts
 */
function getCbitBusinessAccounts() {
  const url = '/v1/businessAccount/banks/cbit'
  return instance.get(url)
}

/**
 * Get cbit business account by id
 * @param {String} accountId
 */
function getCbitBusinessAccountById(accountId: string) {
  const url = `/v1/businessAccount/banks/cbit/${accountId}`
  return instance.get(url)
}

/**
 * Get cbit business account instructions
 * @param {String} accountId
 */
function getCbitBusinessAccountInstructions(accountId: string) {
  const url = `v1/businessAccount/banks/cbit/${accountId}/instructions`
  return instance.get(url)
}

export default {
  getInstance,
  createCbitBusinessAccount,
  getCbitBusinessAccounts,
  getCbitBusinessAccountById,
  getCbitBusinessAccountInstructions,
}
