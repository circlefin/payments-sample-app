import axios from 'axios'
import * as https from 'https'
import { getApplePayCertAndKey } from 'lib/applePaySecrets'
import type { IncomingMessage, ServerResponse } from 'http'



export default async (req: IncomingMessage, res: ServerResponse) => {
    console.log(req.method, req.url, req.headers);
    
    let appleUrl = '';
    req.on('data', (chunk) => {
        appleUrl += chunk;
    });
    req.on('end', () => {
        console.log(appleUrl);
        // let obj = JSON.parse(appleUrl);
        // access obj.myString;

        var appleCert, appleKey = 
            getApplePayCertAndKey(false)
                .then(r -> {
                    
                })
                .catch(e -> {})


        // use set the certificates for the POST request
        var httpsAgent = new https.Agent({
            rejectUnauthorized: false,
            cert: appleCert, // pem apple cert
            key: appleKey,
        });

        var response = axios.post(
            appleUrl,
            {
                merchantIdentifier: 'your.apple.merchant.id',
                domainName: 'yourdomain.com',
                displayName: 'Your Shop Name',
            },
            {
                httpsAgent,
            }
        );
        res.statusCode = 200
        res.end(response)
    });
}