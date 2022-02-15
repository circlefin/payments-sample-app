import type { IncomingMessage, ServerResponse } from 'http'

export default async (req: IncomingMessage, res: ServerResponse) => {
    console.log(req.method, req.url, req.headers);
    
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        console.log(body);
        let obj = JSON.parse(body);

        // access obj.myString;

        res.statusCode = 200
        res.end('Works!')
    });
}