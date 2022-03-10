import axios from 'axios'

// endpoints are hardcoded as they are used only in staging
const BACKEND_URL_VALIDATE_SESSION =
  'https://sample-staging.circle.com/api/applepay/validate'

// default configuration used in staging
const DEFAULT_CONFIG = {
  payments: {
    acceptedCardSchemes: ['amex', 'masterCard', 'visa'],
  },
  shop: {
    product_price: '0.5',
    shop_name: 'Demo Shop',
    shop_localisation: {
      currencyCode: 'USD',
      countryCode: 'US',
    },
  },
  shipping: {
    WORLDWIDE_region: [
      {
        label: 'Free Shipping',
        amount: '0.00',
        detail: 'Arrives instantly',
        identifier: 'freeShipping',
      },
    ],
  },
}

let tokens: ApplePayJS.ApplePayPaymentToken

interface PaymentToken {
  version: string
  data: string
  signature: string
  header: {
    ephemeralPublicKey: string
    publicKeyHash: string
    transactionId: string
  }
}

// Starts the Apple Pay session, registers event handlers
function startApplePaySession(config: any): void {
  const applePaySession: ApplePaySession = new ApplePaySession(6, config)
  handleApplePayEvents(applePaySession)
  applePaySession.begin()
}

// Registers event handlers. There are 5 steps associated with Apple Pay, transition between steps triggers event, these events are:
// onvalidatemerchant, onshippingcontactselected, onshippingmethodselected, completeShippingMethodSelection and onpaymentauthorized.
function handleApplePayEvents(appleSession: ApplePaySession) {
  // This is the first event that Apple triggers. Validate the Apple Pay Session from endpoint.
  appleSession.onvalidatemerchant = function (
    event: ApplePayJS.ApplePayValidateMerchantEvent
  ) {
    // Gets the validationURL at Apple Pay servers from client and sends it to endpoint here (at sample-app) at /applepay/validate.
    // complete validation by calling the appleSession.completeMerchantValidation(merchantSession), by passing the json response we got from Apple.
    validateApplePaySession(
      event.validationURL,
      (merchantSession: any): void => {
        console.log('received session validation response')
        console.log(merchantSession)
        if (merchantSession != null) {
          appleSession.completeMerchantValidation(merchantSession)
        }
      }
    )
  }

  // This method is triggered before populating the shipping methods.
  appleSession.onshippingcontactselected = function (
    event: ApplePayJS.ApplePayShippingContactSelectedEvent
  ) {
    // Populate with the availbale shipping methods for the region (Apple provides the region).
    // Full user address will be available after the user confirms the payment.
    const shipping = getAvailableShippingMethods(
      event.shippingContact.countryCode
    )
    // Update total and line items based on the shipping methods
    const newTotal: ApplePayJS.ApplePayLineItem = {
      type: 'final',
      label: DEFAULT_CONFIG.shop.shop_name,
      amount: calculateTotal(
        DEFAULT_CONFIG.shop.product_price,
        shipping.methods[0].amount
      ),
    }
    const newLineItems: ApplePayJS.ApplePayLineItem[] = [
      {
        type: 'final',
        label: 'Subtotal',
        amount: DEFAULT_CONFIG.shop.product_price,
      },
      {
        type: 'final',
        label: shipping.methods[0].label,
        amount: shipping.methods[0].amount,
      },
    ]
    appleSession.completeShippingContactSelection(
      ApplePaySession.STATUS_SUCCESS, // event was successfully handled
      shipping.methods, // list of shipping methods we want to offer
      newTotal, // different shippint methods may have different prices, make sure that the total displayed in the Apple Pay pop-up is up to date
      newLineItems // show the shipping method selected in the transaction summary of the Apple Pay pop-up
    )
  }

  // This method is triggered when a user select one of the shipping options. Update transaction ammounts on change.
  appleSession.onshippingmethodselected = function (event) {
    const newTotal: ApplePayJS.ApplePayLineItem = {
      type: 'final',
      label: DEFAULT_CONFIG.shop.shop_name,
      amount: calculateTotal(
        DEFAULT_CONFIG.shop.product_price,
        event.shippingMethod.amount
      ),
    }
    const newLineItems: ApplePayJS.ApplePayLineItem[] = [
      {
        type: 'final',
        label: 'Subtotal',
        amount: DEFAULT_CONFIG.shop.product_price,
      },
      {
        type: 'final',
        label: event.shippingMethod.label,
        amount: event.shippingMethod.amount,
      },
    ]
    appleSession.completeShippingMethodSelection(
      ApplePaySession.STATUS_SUCCESS, // event was successfully handled
      newTotal, // total to display
      newLineItems // order summary updated
    )
  }

  // Final event which performs debit. Triggered after the user has confirmed the transaction with the Touch ID or Face ID.
  // All details about the customer are provided and most importantly we get the Apple Pay token in payload needed to perform a payment.
  appleSession.onpaymentauthorized = function (
    event: ApplePayJS.ApplePayPaymentAuthorizedEvent
  ) {
    console.log('received authorization')
    console.log(event.payment)
    console.log(JSON.stringify(event.payment.token))
    tokens = event.payment.token
  }
}

// return the shipping methods available based on region
function getAvailableShippingMethods(_?: string) {
  return { methods: DEFAULT_CONFIG.shipping.WORLDWIDE_region }
}

function calculateTotal(subtotal: string, shipping: string) {
  return (parseFloat(subtotal) + parseFloat(shipping)).toFixed(2)
}

// @param {string} appleUrl The Apple Pay validation URL generated by Apple
// @param {function} callback Callback function used to return the server call outcome
// @return {object} The session payload
function validateApplePaySession(appleUrl: string, callback: any): void {
  axios
    .post(
      BACKEND_URL_VALIDATE_SESSION,
      {
        appleUrl,
      },
      {
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    )
    .then(function (response) {
      callback(response.data)
    })
}

function applePayAvailable(): boolean {
  return ApplePaySession && ApplePaySession.canMakePayments()
  // alternatively, our merchant identifier should be `merchant.bigtimetestmerchant.com`
  // canMakePaymentsWithActiveCard(merchantIdentifier: string):
}

function getApplePayTokens() {
  return tokens
}

export {
  startApplePaySession,
  DEFAULT_CONFIG,
  applePayAvailable,
  PaymentToken,
  getApplePayTokens,
}
