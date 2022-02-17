# A Sample Payments Application

Here you will find a sample web application that demonstrates some of the features of the [Circle Payments API](https://www.circle.com/payments-api).

## Circle API Documentation Portal

For full details on what you can do with [Circle's APIs](https://www.circle.com/developers) and how to use them, please check the [API documentation portal](https://developers.circle.com).

## Clone and configure the sample app

You can manually clone the sample app by running:

```bash
$ git clone https://github.com/circlefin/payments-sample-app.git
```

## Install the dependencies

Run the following to install the dependencies:

```bash
$ yarn install
```

## Run the sample app locally

Run the following to run the sample app locally:

```bash
$ yarn dev
```

The sample app is now running at: `http://localhost:3011/`.

After you [generate an API key for the sandbox environment](https://developers.circle.com/docs/getting-started-with-the-circle-apis#section-api-keys), enter it on the settings tab on the **top right corner of the sample app**.

You are now ready to use the sample app and test some payments flows. In a production environment these payments would settle in the [USDC stablecoin](https://www.circle.com/en/usdc).

## Test Card Numbers

To automatically trigger certain responses from the Circle Payments API, you can use some pre-defined [test card numbers](https://developers.circle.com/docs/test-card-numbers) that exercise specific behaviors.

## Change API base url

By default the API base url will be set to https://api-sandbox.circle.com.

If you would like to point to another API base url you need to create a `.env` file in the project's root folder and configure it as follows:

```bash
$ echo BASE_URL=https://[base-url.com] > .env
```

## Devtools

Dev tools to confirm SNS subscription / receive notifications can be found (here)[https://github.com/circlefin/payments-sample-app/tree/master/devtools]

## Nuxt

This sample app was written with Nuxt. For a more detailed explanation of how Nuxt works, check the [Nuxt.js docs](https://nuxtjs.org).

## Tests

The sample app uses jest for testing. You can find the tests in the `test` folder.

To run the tests:

```bash
$ yarn test
```

To watch the tests:

```bash
$ yarn test:watch
```
