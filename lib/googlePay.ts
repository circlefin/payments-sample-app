import IsReadyToPayRequest = google.payments.api.IsReadyToPayRequest
import PaymentDataRequest = google.payments.api.PaymentDataRequest
import ButtonOptions = google.payments.api.ButtonOptions
import IsReadyToPayResponse = google.payments.api.IsReadyToPayResponse
import IsReadyToPayPaymentMethodSpecification = google.payments.api.IsReadyToPayPaymentMethodSpecification
import Environment = google.payments.api.Environment
import PaymentMethodTokenizationSpecification = google.payments.api.PaymentMethodTokenizationSpecification
import TransactionInfo = google.payments.api.TransactionInfo

const DEFAULT_CONFIG = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: <IsReadyToPayPaymentMethodSpecification>{
    type: 'CARD',
    parameters: {
      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
      allowedCardNetworks: ['MASTERCARD', 'VISA'],
    },
  },
  merchantInfo: {
    merchantId: '12345678901234567890',
    merchantName: 'Example Merchant',
  },
  tokenizationSpecification: {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: 'checkoutltd',
      gatewayMerchantId: 'YOUR_PUBLIC_KEY',
    },
  },
  transactionInfo: {
    currencyCode: 'USD',
    countryCode: 'US',
    totalPriceStatus: 'FINAL',
    totalPrice: '0.00',
    checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE',
  },
  environment: {
    test: <Environment>'TEST',
    prod: <Environment>'PRODUCTION',
  },
}

const AUTOGEN_TOKEN_LENGTH = {
  signature: 40,
  signedMessage: 400,
}

interface PaymentToken {
  protocolVersion: string
  signature: string
  intermediateSigningKey: Object
  signedMessage: string
}

interface PaymentRequestConfig {
  amount: string
  environment: Environment
  merchantId: string
  merchantName: string
  checkoutKey: string
}

function getIsReadyToPayRequest() {
  const isReadyToPayRequest: IsReadyToPayRequest = {
    apiVersion: DEFAULT_CONFIG.apiVersion,
    apiVersionMinor: DEFAULT_CONFIG.apiVersionMinor,
    allowedPaymentMethods: [DEFAULT_CONFIG.allowedPaymentMethods],
  }
  return isReadyToPayRequest
}

function getPaymentDataRequest(config: PaymentRequestConfig) {
  const amount =
    config.amount === null
      ? DEFAULT_CONFIG.transactionInfo.totalPrice
      : config.amount
  const paymentDataRequest: PaymentDataRequest = {
    apiVersion: DEFAULT_CONFIG.apiVersion,
    apiVersionMinor: DEFAULT_CONFIG.apiVersionMinor,
    merchantInfo: {
      merchantId: config.merchantId,
      merchantName: config.merchantName,
    },
    allowedPaymentMethods: [
      {
        type: DEFAULT_CONFIG.allowedPaymentMethods.type,
        parameters: DEFAULT_CONFIG.allowedPaymentMethods.parameters,
        tokenizationSpecification: <PaymentMethodTokenizationSpecification>{
          type: DEFAULT_CONFIG.tokenizationSpecification.type,
          parameters: {
            gateway:
              DEFAULT_CONFIG.tokenizationSpecification.parameters.gateway,
            gatewayMerchantId: config.checkoutKey,
          },
        },
      },
    ],
    transactionInfo: <TransactionInfo>{
      currencyCode: DEFAULT_CONFIG.transactionInfo.currencyCode,
      countryCode: DEFAULT_CONFIG.transactionInfo.countryCode,
      totalPriceStatus: DEFAULT_CONFIG.transactionInfo.totalPriceStatus,
      totalPrice: amount,
      checkoutOption: DEFAULT_CONFIG.transactionInfo.checkoutOption,
    },
  }
  return paymentDataRequest
}

let paymentsClient: any = null

function getGooglePaymentsClient(env: Environment) {
  if (paymentsClient === null) {
    paymentsClient = new google.payments.api.PaymentsClient({
      environment: env,
    })
  }
  return paymentsClient
}

function onGooglePayLoaded(buttonOptions: ButtonOptions, env: Environment) {
  paymentsClient = getGooglePaymentsClient(env)
  paymentsClient
    .isReadyToPay(getIsReadyToPayRequest())
    .then(function (response: IsReadyToPayResponse) {
      if (response.result) {
        const button = paymentsClient.createButton(buttonOptions)
        document.getElementById('google-pay-button')?.append(button)
      }
    })
    .catch(function (err: any) {
      console.error(err)
    })
}

export {
  onGooglePayLoaded,
  getGooglePaymentsClient,
  getPaymentDataRequest,
  PaymentToken,
  PaymentRequestConfig,
  DEFAULT_CONFIG,
  AUTOGEN_TOKEN_LENGTH,
}
