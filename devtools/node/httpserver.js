/*
  Copyright (c) 2020, Circle Internet Financial Trading Company Limited.
  All rights reserved.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL CIRCLE INTERNET FINANCIAL TRADING COMPANY
  LIMITED BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
  OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
  SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
  INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
  CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
  POSSIBILITY OF SUCH DAMAGE.
*/

/* jshint esversion: 6 */

const http = require('http')
const r = require('request')
const MessageValidator = require('sns-validator')

const circleArn = /^arn:aws:sns:.*:908968368384:(sandbox|prod)_platform-notifications-topic$/

const validator = new MessageValidator()

const server = http.createServer((request, response) => {
  if (request.method === 'HEAD') {
    response.writeHead(200, {
      'Content-Type': 'text/html',
    })
    response.end(`HEAD request for ${request.url}`)
    console.log('Received HEAD request')
    return
  }
  if (request.method === 'POST') {
    let body = ''
    request.on('data', (data) => {
      body += data
    })
    request.on('end', () => {
      console.log(`POST request, \nPath: ${request.url}`)
      console.log('Headers: ')
      console.dir(request.headers)
      console.log(`Body: ${body}`)

      response.writeHead(200, {
        'Content-Type': 'text/html',
      })
      response.end(`POST request for ${request.url}`)
      handleBody(body)
    })
  } else {
    const msg = `${request.method} method not supported`
    console.log(msg)
    response.writeHead(400, {
      'Content-Type': 'text/html',
    })
    response.end(msg)
    return
  }

  const handleBody = (body) => {
    const envelope = JSON.parse(body)
    validator.validate(envelope, (err) => {
      if (err) {
        console.error(err)
      } else {
        switch (envelope.Type) {
          case 'SubscriptionConfirmation': {
            if (!circleArn.test(envelope.TopicArn)) {
              console.error(
                `\nUnable to confirm the subscription as the topic arn is not expected ${envelope.TopicArn}. Valid topic arn must match ${circleArn}.`
              )
              break
            }
            r(envelope.SubscribeURL, (err) => {
              if (err) {
                console.error('Subscription NOT confirmed.', err)
              } else {
                console.log('Subscription confirmed.')
              }
            })
            break
          }
          case 'Notification': {
            console.log(`Received message ${envelope.Message}`)
            break
          }
          default: {
            console.error(`Message of type ${body.Type} not supported`)
          }
        }
      }
    })
  }
})

const args = process.argv.slice(2)
let host = '127.0.0.1'
let port = 8080
if (args.length === 2) {
  host = args[0]
  port = args[1]
}
if (args.length === 1) {
  port = args[0]
}
server.listen(port, host)
console.log(`Starting httpd on port ${port}`)
