import IsReadyToPayRequest = google.payments.api.IsReadyToPayRequest
import PaymentDataRequest = google.payments.api.PaymentDataRequest
import ButtonOptions = google.payments.api.ButtonOptions
import IsReadyToPayResponse = google.payments.api.IsReadyToPayResponse

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

let paymentsClient: any = null

function getGooglePaymentsClient() {
  if (paymentsClient === null) {
    paymentsClient = new google.payments.api.PaymentsClient({
      environment: 'TEST',
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
        document.body.append(button)
      }
    })
    .catch(function (err: any) {
      console.error(err)
    })
}

function onGooglePayButtonClicked() {
  paymentsClient.loadPaymentData(paymentDataRequest).catch(function (err: any) {
    console.error(err)
  })
}

export { isReadyToPayRequest, onGooglePayLoaded }
