# A Sample Payments Application

Here you will find a sample web application that demonstrates some of the features of the [Circle Payments API](https://www.circle.com/payments-api).

## Circle API Documentation Portal

For full details on what you can do with [Circle's APIs](https://www.circle.com/developers) and how to use them, please check the [API documentation portal](https://developers.circle.com).

## Clone and configure the sample app

You can manually clone the sample app by running:

```bash
$ git clone https://github.com/circlefin/payments-sample-app
```

Create a `.env` file in the project's root folder in order to configure the base url for api calls. To run the sample app against the sandbox environment API endpoints, configure it as follows:

```bash
$ echo BASE_URL=https://api-sandbox.circle.com > .env
```

## Install the dependencies

Run the following to install the dependencies:

``` bash
$ yarn install
```

## Run the sample app locally

Run the following to run the sample app locally:

``` bash
$ yarn dev
```

The sample app is now running at: `http://localhost:3011/`

## Test Card Numbers

To automatically trigger certain responses from the Circle Payments API, you can use some pre-defined [test card numbers](https://developers.circle.com/docs/test-card-numbers) that exercise specific behaviors.

## Nuxt

This sample app was written with Nuxtt. For a more detailed explanation of Nuxt works, check the [Nuxt.js docs](https://nuxtjs.org).

## Tests

The sample app uses jest for testing. You can find the tests in the `test` folder.

To run the tests:

``` bash
$ yarn test
```

To watch the tests:

``` bash
$ yarn test:watch
```
