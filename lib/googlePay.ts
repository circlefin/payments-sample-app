import IsReadyToPayRequest = google.payments.api.IsReadyToPayRequest
import PaymentDataRequest = google.payments.api.PaymentDataRequest
import ButtonOptions = google.payments.api.ButtonOptions
import IsReadyToPayResponse = google.payments.api.IsReadyToPayResponse
import IsReadyToPayPaymentMethodSpecification = google.payments.api.IsReadyToPayPaymentMethodSpecification

const DEFAULT_CONFIG = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: <IsReadyToPayPaymentMethodSpecification> {
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
    totalPrice: '12.00',
    checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE',
  },
}

// const isReadyToPayRequest: IsReadyToPayRequest = {
//   apiVersion: 2,
//   apiVersionMinor: 0,
//   allowedPaymentMethods: [
//     {
//       type: 'CARD',
//       parameters: {
//         allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
//         allowedCardNetworks: ['MASTERCARD', 'VISA'],
//       },
//     },
//   ],
// }

function getIsReadyToPayRequest() {
  const isReadyToPayRequest: IsReadyToPayRequest = {
    apiVersion: DEFAULT_CONFIG.apiVersion,
    apiVersionMinor: DEFAULT_CONFIG.apiVersionMinor,
    allowedPaymentMethods: [DEFAULT_CONFIG.allowedPaymentMethods],
  }
  return isReadyToPayRequest
}

// const defaultPaymentMethods: IsReadyToPayPaymentMethodSpecification = {
//   type: 'CARD',
//   parameters: {
//     allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
//     allowedCardNetworks: ['MASTERCARD', 'VISA'],
//   },
// }

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

interface PaymentToken {
  protocolVersion: string
  signature: string
  intermediateSigningKey: Object
  signedMessage: string
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

function onGooglePayLoaded(buttonOptions: ButtonOptions) {
  paymentsClient = getGooglePaymentsClient()
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
  paymentDataRequest,
  PaymentToken,
}
