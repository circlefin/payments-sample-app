import * as https from 'https'
import axios from 'axios'
import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import {
  partnershipMerchantIdentityCertificate,
  partnershipMerchantIdentityKey,
  payfacMerchantIdentityCertificate,
  payfacMerchantIdentityKey,
  partnershipMerchantId,
  payfacMerchantId,
} from './applePaySettings'
import { apiHostname, domainName } from './serverEnv'

const app = express()
const DISPLAY_NAME = 'Circle Apple Pay'

// Steps:
// 1) validate session, requested by client
// 2) pay with apple token

// Validates Apple Pay Session, requested by client by providing appleUrl at which we validate
// responds with validation to client
app.post('/validate', (req, res) => {
  req.on('data', (data) => {
    // data is in byte array so first transform it to string and then parse it to object, and then take it's property appleUrl
    const { appleUrl, merchantType } = JSON.parse(data.toString())
    const cert =
      merchantType === 'PayFac'
        ? payfacMerchantIdentityCertificate
        : partnershipMerchantIdentityCertificate // pem apple cert
    const key =
      merchantType === 'PayFac'
        ? payfacMerchantIdentityKey
        : partnershipMerchantIdentityKey

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      cert,
      key,
    })
    const requestData = {
      merchantIdentifier:
        merchantType === 'PayFac' ? payfacMerchantId : partnershipMerchantId,
      domainName,
      displayName: DISPLAY_NAME,
    }
    axios
      .post(appleUrl, requestData, {
        httpsAgent,
      })
      .then((a) => {
        // return the json received from Apple Pay server unmodified
        res.send(a.data)
      })
      .catch((a) => {
        res.send({
          errorMessage: a.message,
          responseStatus: a.response.status,
          responseData: a.response.data,
          responseHeaders: a.response.headers,
        })
      })
  })
})

export interface TokensPayload {
  idempotencyKey: string
  type: string
  tokenData: {
    version: string
    data: string
    signature: string
    header: {
      ephemeralPublicKey: string
      publicKeyHash: string
      transactionId: string
    }
  }
}

const instance = axios.create({
  baseURL: apiHostname,
})

function sendToken(token: ApplePayJS.ApplePayPaymentToken, apiKey: string) {
  const url = '/v1/paymenttokens'

  const config = {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  }

  const payload: TokensPayload = {
    idempotencyKey: uuidv4(),
    type: 'applepay',
    tokenData: {
      version: token.paymentData.version,
      data: token.paymentData.data,
      signature: token.paymentData.signature,
      header: {
        ephemeralPublicKey: token.paymentData.header.ephemeralPublicKey,
        publicKeyHash: token.paymentData.header.publicKeyHash,
        transactionId: token.paymentData.header.transactionId,
      },
    },
  }
  return instance.post(url, payload, config)
}

interface MetaData {
  email: string
  phoneNumber?: string
  sessionId: string
  ipAddress: string
}

export interface BasePaymentPayload {
  idempotencyKey: string
  amount: {
    amount: string
    currency: string
  }
  source: {
    id: string
    type: string
  }
  description: string
  metadata: MetaData
}

function createPaymentPayload(sourceId: string): BasePaymentPayload {
  return {
    idempotencyKey: uuidv4(),
    amount: {
      amount: '0.5',
      currency: 'USD',
    },
    source: {
      id: sourceId,
      type: 'token',
    },
    description: 'apple pay test',
    metadata: {
      phoneNumber: '+15103901174',
      email: 'wallet@circle.com',
      sessionId: 'xxx',
      ipAddress: '172.33.222.1',
    },
  }
}

function createPayment(payload: BasePaymentPayload, apiKey: string) {
  const config = {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  }

  const url = '/v1/payments'
  return instance.post(url, payload, config)
}

// after client recieves session validation, client provides apple pay token which we use to hit EFT endpoint
app.post('/pay', (req, res) => {
  req.on('data', (data) => {
    // data is in byte array so first transform it to string and then parse it to object
    const request = JSON.parse(data.toString())

    const details: ApplePayJS.ApplePayPayment = request.details
    const apiKey: string = request.apiKey

    const responseToClient = {
      approved: false,
      logs: '',
      details: details.token,
    }

    sendToken(details.token, apiKey)
      .then((response) => {
        createPayment(createPaymentPayload(response.data.id), apiKey)
          .then((innerResponse) => {
            responseToClient.approved = true
            responseToClient.logs =
              responseToClient.logs +
              JSON.stringify(response.data) +
              ';apiurl=' +
              apiHostname +
              ';innerResponse=' +
              JSON.stringify(innerResponse.data)
            res.send(responseToClient)
          })
          .catch((innerErr) => {
            responseToClient.logs =
              responseToClient.logs + ';message:' + JSON.stringify(innerErr)
            res.send(responseToClient)
          })
      })
      .catch((err) => {
        responseToClient.logs =
          responseToClient.logs + ';message:' + JSON.stringify(err)
        res.send(responseToClient)
      })
  })
})

export default {
  path: '/api/applepay',
  handler: app,
}
