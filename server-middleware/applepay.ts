import express from 'express'
const app = express()

app.post('/pay', async (req, res) => {
  res.send('pay')
})

app.post('/validate', async (req, res) => {
  res.send('unfinished')
})

export default {
  path: '/applepay',
  handler: app,
}
