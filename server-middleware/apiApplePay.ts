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

// Validates Apple Pay Session, requested by client by providing appleUrl at which we validate
// responds with validation to client
app.post('/validate', (req, res) => {
  req.on('data', (data) => {
    // data is in byte array so first transform it to string and then parse it to object, and then take it's property appleUrl
    const { appleUrl } = JSON.parse(data.toString())
    console.log(JSON.parse(data.toString()).appleUrl)

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
        console.log('Successfully validated apple pay session')
        // return the json received from Apple Pay server unmodified
        res.send(a.data)
      })
      .catch((a) => {
        res.send({ data: null })
        console.log('Error occured during session validation')
        console.log(a.message)
        console.log(a.response.status)
        console.log(a.response.data)
        console.log(a.response.headers)
      })
  })
})

// after client recieves session validation, client provides apple pay token which we use to hit EFT endpoint
app.post('/pay', (req, res) => {
  req.on('data', (data) => {
    // data is in byte array so first transform it to string and then parse it to object, and then take it's property details
    const details: ApplePayJS.ApplePayPayment = JSON.parse(
      data.toString()
    ).details

    console.log(JSON.stringify(details))
    // soon will update with call to wallets API endpoint

    res.send({
      approved: true,
    })
  })
})

export default {
  path: '/api/applepay',
  handler: app,
}
