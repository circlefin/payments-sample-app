#  Copyright (c) 2020, Circle Internet Financial Trading Company Limited.
#  All rights reserved.
#
#  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
#  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
#  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
#  ARE DISCLAIMED. IN NO EVENT SHALL CIRCLE INTERNET FINANCIAL TRADING COMPANY
#  LIMITED BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
#  OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
#  SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
#  INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
#  CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
#  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
#  POSSIBILITY OF SUCH DAMAGE.

from http.server import BaseHTTPRequestHandler, HTTPServer
import logging
import json
import urllib.request
import re
import sys

circleArn = re.compile("^arn:aws:sns:.*:908968368384:(sandbox|prod)_platform-notifications-topic$")

class Server(BaseHTTPRequestHandler):
    def _set_response(self, code=200):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

    def circleArn(self, topicArn):
        return re.search("", topicArn)

    def do_HEAD(self):
        logging.info("HEAD request,\nPath: %s\nHeaders:\n%s\n\n",
                     str(self.path), str(self.headers))
        self._set_response(code=200)

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
                     str(self.path), str(self.headers), post_data.decode('utf-8'))

        envelope = json.loads(post_data.decode('utf-8'))

        if not circleArn.match(envelope.get("TopicArn")):
            logging.error("Unable to confirm the subscription as the topic arn is not expected %s. Valid topic arn must match %s", envelope.get("TopicArn"), circleArn.pattern)
            self._set_response(code=400)
            return

        url = envelope.get("SubscribeURL")

        if url is not None and url.lower().startswith('http'):
            req = urllib.request.Request(url)
            # nosec as url is from AWS
            with urllib.request.urlopen(req) as response:
                if response.status == 200:
                    logging.info("Subscription confirmed for url %s", url)
                else:
                    logging.error("GET request to %s failed.", url)
                self._set_response(code=response.status)
        else:
            logging.info("Received message %s.", post_data.decode('utf-8'))
            self._set_response()

        self.wfile.write("POST request for {}".format(self.path).encode('utf-8'))


def run(server_class=HTTPServer, handler_class=Server, port=8080):
    logging.basicConfig(level=logging.INFO)
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    logging.info('Starting httpd on port %s\n', str(port))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    logging.info('Stopping httpd...\n')


if __name__ == '__main__':
    from sys import argv

    if len(argv) > 1:
        run(port=int(argv[1]))
    else:
        run()
