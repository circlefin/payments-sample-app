import express from 'express'
import { domainValidation } from './applePaySettings'

const router = express()

router.get('/apple-developer-merchantid-domain-association.txt', (_, res) => {
  res.setHeader('content-type', 'text/plain')
  res.send(domainValidation)
})

export default {
  path: '/.well-known',
  handler: router,
}
