import type { IncomingMessage, ServerResponse } from 'http'

// this is where we get apple pay token and could go to checkout to debit
export default async (req: IncomingMessage, res: ServerResponse) => {
  console.log(
    'Apple Pay token received, when endpoint on a target service is implemented this will be updated'
  )
  res.statusCode = 200
  res.end()
}
