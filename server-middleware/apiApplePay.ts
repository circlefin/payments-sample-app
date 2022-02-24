import * as https from 'https'
import axios from 'axios'
import express from 'express'
import {
  merchantIdentityCertificate,
  merchantIdentityKey,
} from './applePaySettings'

const app = express()
const MERCHANT_IDENTIFIER = 'merchant.bigtimetestmerchant.com'
const DOMAIN_NAME = 'sample-staging.circle.com'
const DISPLAY_NAME = 'Circle Apple Pay'

// Steps:
// 1) validate session, requested by client
// 2) pay with apple token

// Validates Apple Pay Session, requested by client by providing applePayUrl at which we validate
// responds with validation to client
app.post('/validate', async (req, res) => {
  const { applePayUrl } = req.body
  console.log(applePayUrl)
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    cert: merchantIdentityCertificate, // pem apple cert
    key: merchantIdentityKey, // key apple
  })
  const response = await axios.post(
    applePayUrl,
    {
      merchantIdentifier: MERCHANT_IDENTIFIER,
      domainName: DOMAIN_NAME,
      displayName: DISPLAY_NAME,
    },
    {
      httpsAgent,
    }
  )
  // return the json received from Apple Pay server unmodified
  res.send(response.data)
})

// after client recieves session validation, client provides apple pay token which we use to hit EFT endpoint
app.post('/pay', (req, res) => {
  const { data } = req.body

  console.log(data)
  // TODO send to processing endpoint once endpoint is ready

  res.send({
    approved: true,
  })
})

export default {
  path: '/api/applepay',
  handler: app,
}
