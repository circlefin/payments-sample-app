import express from 'express'
const app = express()

app.get('/applePaySessionValidation', async (req, res) => {
  res.send('love to the world')
})

export default {
  path: '/restapi',
  handler: app,
}
