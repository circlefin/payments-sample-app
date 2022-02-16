import axios from 'axios'
import * as https from 'https'
import {
  merchantIdentityCertificate,
  merchantIdentityKey,
} from 'lib/applePaySecrets'
import type { IncomingMessage, ServerResponse } from 'http'

export default async (req: IncomingMessage, res: ServerResponse) => {
  // console.log(req.method, req.url, req.headers)
  let appleUrl = ''
  req.on('data', (chunk) => {
    appleUrl += chunk
  })
  req.on('end', () => {
    var httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      cert: merchantIdentityCertificate, // pem apple cert
      key: merchantIdentityKey, // key apple
    })
    var response = axios.post(
      appleUrl,
      {
        merchantIdentifier: 'merchant.bigtimetestmerchant.com',
        domainName: 'sample-staging.circle.com',
        displayName: 'Circle Apple Pay',
      },
      {
        httpsAgent,
      }
    )
    res.statusCode = 200
    res.end(response)
  })
}
