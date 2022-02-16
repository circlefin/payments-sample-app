import type { IncomingMessage, ServerResponse } from 'http'

// endpoint where we recieve
export default async (req: IncomingMessage, res: ServerResponse) => {
  console.log(
    'Apple Pay token received, when endpoint on a target service is implemented this will be updated'
  )
  res.statusCode = 200
  res.end()
}
