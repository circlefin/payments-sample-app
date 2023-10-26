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

export interface CreateMockPushPaymentPayload {
  trackingRef: string
  beneficiaryBank: {
    accountNumber: string
  }
  amount: {
    amount: string
    currency: string
  }
  rail: string
}

export interface CreateMockChargebackPayload {
  paymentId: string
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

/** Returns the axios instance */
function getInstance() {
  return instance
}

/**
 * Trigger arrival of an incoming wire
 * @param {*} payload
 */
function createMockWirePayment(payload: CreateMockPushPaymentPayload) {
  const url = '/v1/mocks/payments/wire'
  return instance.post(url, payload)
}

/**
 * Create a mock chargeback
 * @param {*} payload
 */
function createMockChargeback(payload: CreateMockChargebackPayload) {
  const url = '/v1/mocks/cards/chargebacks'
  return instance.post(url, payload)
}

export default {
  getInstance,
  createMockWirePayment,
  createMockChargeback,
}
