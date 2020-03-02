# Payments Sample App

> Sample App for Circle Payments API

## Official Documentation

The full documentation reference can be seen [here](https://developers.circle.com/docs)

## Config

Create a `.env` file in the root folder to configure the base url for api calls.  To run against the sandbox environment (which uses fake money), set it as follows:
```bash
$ echo BASE_URL=https://api-sandbox.circle.com > .env
```

## Install dependencies

``` bash
# Install dependencies
$ yarn install
```

## Development

``` bash
# serve with hot reload at localhost:3002
$ yarn dev
```

Server is running at: `http://localhost:3011/`

## Test Card Numbers

To automatically trigger certain responses from the API, you can input different [test card numbers](https://developers.circle.com/docs/test-card-numbers)

## Nuxt

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## Tests

We use jest to write tests. You can find the tests in the `test` dir.

Run tests:
``` bash
$ yarn test
```

Watch tests:
``` bash
$ yarn test:watch
```
