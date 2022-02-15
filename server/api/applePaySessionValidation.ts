import axios from 'axios'
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
        res.send(response.data);

        res.statusCode = 200
        res.end('Works!')
    });
}