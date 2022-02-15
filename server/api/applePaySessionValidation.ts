import axios from 'axios'
import * as https from 'https'
import { getApplePayCertAndKey } from 'lib/applePaySecrets'
import type { IncomingMessage, ServerResponse } from 'http'

export default async (req: IncomingMessage, res: ServerResponse) => {
    // console.log(req.method, req.url, req.headers)
    let appleUrl = ''
    req.on('data', (chunk) => {
        appleUrl += chunk
    })
    req.on('end', () => {
        // console.log(appleUrl)
        getApplePayCertAndKey(false)
            .then(result => {
                var httpsAgent = new https.Agent({
                    rejectUnauthorized: false,
                    cert: result[0], // pem apple cert
                    key: result[1], // key apple
                })
                var response = axios.post(
                    appleUrl,
                    {
                        merchantIdentifier: 'TODO.apple.merchant.id',
                        domainName: 'TODO.domain.com',
                        displayName: 'TODO Shop Name',
                    },
                    {
                        httpsAgent,
                    }
                )
                res.statusCode = 200
                res.end(response)
            })
            .catch(e => {
                // retry obtaining keys
                getApplePayCertAndKey(true)

                // respond with server error
                res.statusCode = 500
                res.end(null)
            })        
    })
}