#### Dev Tools

#### HTTP server for local debug

In order to confirm SNS subscriptions / receive notifications a local server could be useful. The sample server allows to:
-   confirm a subscription
-   log notification messages

To start the server
```sh
cd python
# starts the server at specified interface and port 8080
python httpserver.py --bind 127.0.0.1
   
# starts the server at custom interface and port 8000 
python httpserver.py 8000 --bind 127.0.0.1
```
or for node server
```sh
cd node
npm install

# starts the server at 127.0.0.1:8080
node httpserver.js 

# starts the server at custom interface and port
node httpserver.js 127.0.0.1 8000 
```

To expose the server IP to the internet some tools such as [ngrok](https://ngrok.com/download) or [localhost.run](http://localhost.run) can be used:

```sh
# ngrock
ngrok http 8080
...
Forwarding                    http://<ID>.ngrok.io -> http://localhost:8080
Forwarding                    https://<ID>.ngrok.io -> http://localhost:8080

# localhost.run
# use 'uuidgen' to create a unique-domain-name
ssh -R 80:localhost:8080 $(uuidgen)@ssh.localhost.run
...
Connect to http://<unique-domain-name>.localhost.run
```
