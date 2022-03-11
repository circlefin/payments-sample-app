import * as https from 'https'
import axios from 'axios'
import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import {
  merchantIdentityCertificate,
  merchantIdentityKey,
  apiUrl
} from './applePaySettings'

const app = express()
const MERCHANT_IDENTIFIER = 'merchant.bigtimetestmerchant.com'
const DOMAIN_NAME = 'sample-staging.circle.com'
const DISPLAY_NAME = 'Circle Apple Pay'
const instance = axios.create({
  baseURL: apiUrl,
})

// Validates Apple Pay Session, requested by client by providing appleUrl at which we validate
// responds with validation to client
app.post('/validate', (req, res) => {
  req.on('data', (data) => {
    // data is in byte array so first transform it to string and then parse it to object, and then take it's property appleUrl
    const { appleUrl } = JSON.parse(data.toString())
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      cert: merchantIdentityCertificate, // pem apple cert
      key: merchantIdentityKey, // key apple
    })
    axios
      .post(
        appleUrl,
        {
          merchantIdentifier: MERCHANT_IDENTIFIER,
          domainName: DOMAIN_NAME,
          displayName: DISPLAY_NAME,
        },
        {
          httpsAgent,
        }
      )
      .then((a) => {
        res.send(a.data)
      })
      .catch((a) => {
        res.send({})
      })
  })
})

// after client recieves session validation, client provides apple pay token which we use to hit EFT endpoint
app.post('/convert', (req, res) => {
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

    console.log(JSON.stringify(details))
    sendToken(details.token, apiKey)
      .then(() => {
        responseToClient.approved = true
        res.send(responseToClient)
      })
      .catch((err) => {
        responseToClient.logs = '\n+sendTokenErr: ' + JSON.stringify(err)
        res.send(responseToClient)
      })
  })
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

export default {
  path: '/api/applepay',
  handler: app,
}
