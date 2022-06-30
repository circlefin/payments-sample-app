import express from 'express'
import { checkoutKey, merchantId, merchantName } from './googlePaySecrets'

const app = express()

app.get('/values', (_, res) => {
  res.send({ merchantId, merchantName, checkoutKey })
})

export default {
  path: '/api/googlepay',
  handler: app,
}
