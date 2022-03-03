import IsReadyToPayRequest = google.payments.api.IsReadyToPayRequest
import PaymentDataRequest = google.payments.api.PaymentDataRequest
import ButtonOptions = google.payments.api.ButtonOptions
import IsReadyToPayResponse = google.payments.api.IsReadyToPayResponse
import PaymentData = google.payments.api.PaymentData

const isReadyToPayRequest: IsReadyToPayRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['MASTERCARD', 'VISA'],
      },
    },
  ],
}

const paymentDataRequest: PaymentDataRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
  merchantInfo: {
    merchantId: '12345678901234567890',
    merchantName: 'Example Merchant',
  },
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['MASTERCARD', 'VISA'],
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'checkoutltd',
          gatewayMerchantId: 'YOUR_PUBLIC_KEY',
        },
      },
    },
  ],
  transactionInfo: {
    currencyCode: 'USD',
    countryCode: 'US',
    totalPriceStatus: 'FINAL',
    totalPrice: '12.00',
    checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE',
  },
}

const buttonOptions: ButtonOptions = {
  onClick: onGooglePayButtonClicked,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['MASTERCARD', 'VISA'],
      },
    },
  ],
}

interface PaymentToken {
  protocolVersion: String
  signature: String
  intermediateSigningKey: Object
  signedMessage: String
}

let paymentsClient: any = null

function getGooglePaymentsClient() {
  if (paymentsClient === null) {
    paymentsClient = new google.payments.api.PaymentsClient({
      environment: 'TEST', // TODO: get real environment once implementation is finished
    })
  }
  return paymentsClient
}

function onGooglePayLoaded() {
  paymentsClient = getGooglePaymentsClient()
  paymentsClient
    .isReadyToPay(isReadyToPayRequest)
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

function onGooglePayButtonClicked() {
  const paymentsClient = getGooglePaymentsClient()
  paymentsClient
    .loadPaymentData(paymentDataRequest)
    .then(function (paymentData: PaymentData) {
      console.log(paymentData)
      const paymentTokenString =
        paymentData.paymentMethodData.tokenizationData.token // payment token as JSON string
      const paymentToken: PaymentToken = JSON.parse(paymentTokenString) // payment token as object with keys protocolVersion, signature, and signedMessage
      console.log(paymentToken)
      // TODO: update form fields with values from paymentToken - how to do this?
    })
    .catch(function (err: any) {
      console.error(err)
    })
}

export { onGooglePayLoaded }
