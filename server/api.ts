import { ServerMiddleware } from '@nuxt/types'

const pingHandler: ServerMiddleware = (_req, res) => {
  res.statusCode = 200
  res.end('pong')
}

export default pingHandler
