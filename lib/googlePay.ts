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
import IsReadyToPayRequest = google.payments.api.IsReadyToPayRequest
import PaymentDataRequest = google.payments.api.PaymentDataRequest
import ButtonOptions = google.payments.api.ButtonOptions
import IsReadyToPayResponse = google.payments.api.IsReadyToPayResponse
import IsReadyToPayPaymentMethodSpecification = google.payments.api.IsReadyToPayPaymentMethodSpecification
import Environment = google.payments.api.Environment
import PaymentMethodTokenizationSpecification = google.payments.api.PaymentMethodTokenizationSpecification
import TransactionInfo = google.payments.api.TransactionInfo
import PaymentData = google.payments.api.PaymentData
import { getIsStaging } from '~/lib/apiTarget'

const DEFAULT_CONFIG = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: <IsReadyToPayPaymentMethodSpecification>{
    type: 'CARD',
    parameters: {
      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
      allowedCardNetworks: ['MASTERCARD', 'VISA'],
    },
  },
  merchantInfo: {
    merchantId: '12345678901234567890',
    merchantName: 'Example Merchant',
  },
  tokenizationSpecification: {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: 'checkoutltd',
      gatewayMerchantId: 'YOUR_PUBLIC_KEY',
    },
  },
  transactionInfo: {
    currencyCode: 'USD',
    countryCode: 'US',
    totalPriceStatus: 'FINAL',
    totalPrice: '0.00',
    checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE',
  },
  environment: {
    test: <Environment>'TEST',
    prod: <Environment>'PRODUCTION',
  },
}

const BACKEND_URL_GET_VALUES = getIsStaging()
  ? 'https://sample-staging.circle.com/api/googlepay/values'
  : 'https://sample.circle.com/api/googlepay/values'

const AUTOGEN_TOKEN_LENGTH = {
  signature: 40,
  signedMessage: 400,
}

interface PaymentToken {
  protocolVersion: string
  signature: string
  intermediateSigningKey: Object
  signedMessage: string
}

interface PaymentRequestConfig {
  amount: string
  environment: Environment
  merchantId: string
  merchantName: string
  checkoutKey: string
}

function getIsReadyToPayRequest() {
  const isReadyToPayRequest: IsReadyToPayRequest = {
    apiVersion: DEFAULT_CONFIG.apiVersion,
    apiVersionMinor: DEFAULT_CONFIG.apiVersionMinor,
    allowedPaymentMethods: [DEFAULT_CONFIG.allowedPaymentMethods],
  }
  return isReadyToPayRequest
}

function getPaymentDataRequest(config: PaymentRequestConfig) {
  const amount =
    config.amount === null
      ? DEFAULT_CONFIG.transactionInfo.totalPrice
      : config.amount
  const paymentDataRequest: PaymentDataRequest = {
    apiVersion: DEFAULT_CONFIG.apiVersion,
    apiVersionMinor: DEFAULT_CONFIG.apiVersionMinor,
    merchantInfo: {
      merchantId: config.merchantId,
      merchantName: config.merchantName,
    },
    allowedPaymentMethods: [
      {
        type: DEFAULT_CONFIG.allowedPaymentMethods.type,
        parameters: DEFAULT_CONFIG.allowedPaymentMethods.parameters,
        tokenizationSpecification: <PaymentMethodTokenizationSpecification>{
          type: DEFAULT_CONFIG.tokenizationSpecification.type,
          parameters: {
            gateway:
              DEFAULT_CONFIG.tokenizationSpecification.parameters.gateway,
            gatewayMerchantId: config.checkoutKey,
          },
        },
      },
    ],
    transactionInfo: <TransactionInfo>{
      currencyCode: DEFAULT_CONFIG.transactionInfo.currencyCode,
      countryCode: DEFAULT_CONFIG.transactionInfo.countryCode,
      totalPriceStatus: DEFAULT_CONFIG.transactionInfo.totalPriceStatus,
      totalPrice: amount,
      checkoutOption: DEFAULT_CONFIG.transactionInfo.checkoutOption,
    },
  }
  return paymentDataRequest
}

let paymentsClient: any = null

function getGooglePaymentsClient(env: Environment) {
  if (paymentsClient === null) {
    paymentsClient = new google.payments.api.PaymentsClient({
      environment: env,
    })
  }
  return paymentsClient
}

function onGooglePayLoaded(buttonOptions: ButtonOptions, env: Environment) {
  paymentsClient = getGooglePaymentsClient(env)
  paymentsClient
    .isReadyToPay(getIsReadyToPayRequest())
    .then(function (response: IsReadyToPayResponse) {
      if (response.result) {
        const button = paymentsClient.createButton(buttonOptions)
        document.getElementById('google-pay-button')?.append(button)
      }
    })
    .catch(function (err: any) {
      console.error(err)
    })
}

function onGooglePayClicked(
  amount: string,
  callback: (paymentData: PaymentData) => void
) {
  const environment = DEFAULT_CONFIG.environment.prod
  const paymentsClient = getGooglePaymentsClient(environment)
  axios
    .get(BACKEND_URL_GET_VALUES, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
    .then(function (response) {
      const paymentDataConfig: PaymentRequestConfig = {
        amount,
        environment,
        merchantId: response.data.merchantId,
        merchantName: response.data.merchantName,
        checkoutKey: response.data.checkoutKey,
      }
      paymentsClient
        .loadPaymentData(getPaymentDataRequest(paymentDataConfig))
        .then((paymentData: PaymentData) => {
          callback(paymentData)
        })
        .catch(function (err: any) {
          console.error(err)
        })
    })
}

export {
  onGooglePayLoaded,
  getGooglePaymentsClient,
  getPaymentDataRequest,
  PaymentToken,
  PaymentRequestConfig,
  DEFAULT_CONFIG,
  AUTOGEN_TOKEN_LENGTH,
  onGooglePayClicked,
}
