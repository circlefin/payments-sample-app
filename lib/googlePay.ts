import IsReadyToPayRequest = google.payments.api.IsReadyToPayRequest
import PaymentDataRequest = google.payments.api.PaymentDataRequest
import ButtonOptions = google.payments.api.ButtonOptions

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

const buttonOptions: ButtonOptions = {}

function onGooglePayLoaded() {
  const paymentsClient = new google.payments.api.PaymentsClient({ environment: 'TEST' })
  paymentsClient
    .isReadyToPay(isReadyToPayRequest)
    .then(function (response) {
      if (response.result) {
        const button = paymentsClient.createButton(buttonOptions)
        document.getElementById('google-pay-button').append(button)
      } else {
        console.log('no google pay button')
      }
    })
    .catch(function (err) {
      console.error(err)
    })
}

// function googlePayAvailable() {
//   return
// }

export { isReadyToPayRequest, onGooglePayLoaded }
