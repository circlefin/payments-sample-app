import axios from 'axios'
import express from 'express'
import * as https from 'https'
import {
  merchantIdentityCertificate,
  merchantIdentityKey,
} from '~/server/applePaySecrets'

const app = express()
const MERCHANT_IDENTIFIER = 'merchant.bigtimetestmerchant.com'
const DOMAIN_NAME = 'sample-staging.circle.com'
const DISPLAY_NAME = 'Circle Apple Pay'

app.post('/pay', async (req, res) => {
  const appleUrl: string = req.body

  var httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    cert: merchantIdentityCertificate, // pem apple cert
    key: merchantIdentityKey, // key apple
  })
  var response = axios.post(
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

  res.send('pay')
})

app.post('/validate', async (req, res) => {
  console.log(
    'Apple Pay token received, when endpoint on a target service is implemented this will be updated'
  )
  res.send('unfinished')
})

export default {
  path: '/applepay',
  handler: app,
}
