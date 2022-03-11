import axios from 'axios'

// endpoints are hardcoded as they are used only in staging
const BACKEND_URL_VALIDATE_SESSION =
  'https://sample-staging.circle.com/api/applepay/validate'
const BACKEND_URL_CONVERT_TOKEN = 'https://sample-staging.circle.com/api/applepay/convert'

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
  shippingMethods: [
    {
      label: 'Free Shipping',
      amount: '0.00',
      detail: 'Arrives instantly',
      identifier: 'freeShipping',
    },
  ]
}

let tokenResponse = {};
let totalAmount = '0.00';
let lineItemType: 'final';
let shopName = '';

// Starts the Apple Pay session, registers event handlers
function startApplePaySession(config: any, apiKey: string): void {
  totalAmount = config.total.amount;
  lineItemType = config.total.lineItemType;
  shopName = config.total.shopName;
  const applePaySession: ApplePaySession = new ApplePaySession(6, config)
  handleApplePayEvents(applePaySession, apiKey)
  applePaySession.begin()
}

// Registers event handlers. There are 5 steps associated with Apple Pay, transition between steps triggers event, these events are:
// onvalidatemerchant, onshippingcontactselected, onshippingmethodselected, completeShippingMethodSelection and onpaymentauthorized.
function handleApplePayEvents(appleSession: ApplePaySession, apiKey: string) {
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
      type: lineItemType,
      label: shopName,
      amount: calculateTotal(
        totalAmount,
        shipping.methods[0].amount
      ),
    }
    const newLineItems: ApplePayJS.ApplePayLineItem[] = [
      {
        type: lineItemType,
        label: shopName,
        amount: totalAmount,
      }
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
      type: lineItemType,
      label: shopName,
      amount: calculateTotal(
        totalAmount,
        event.shippingMethod.amount
      ),
    }
    const newLineItems: ApplePayJS.ApplePayLineItem[] = [
      {
        type: lineItemType,
        label: shopName,
        amount: totalAmount,
      },
      {
        type: lineItemType,
        label: shopName,
        amount: totalAmount,
      },
    ]
    appleSession.completeShippingMethodSelection(
      ApplePaySession.STATUS_SUCCESS, // event was successfully handled
      newTotal, // total to display
      newLineItems // order summary updated
    )
  }

  // Final event which occurs after face/touch id approval, and converts an apple pay token into a Circle tokenized fiat account
  appleSession.onpaymentauthorized = function (
    event: ApplePayJS.ApplePayPaymentAuthorizedEvent
  ) {
    console.log(event.payment)
    performTransaction(event.payment, apiKey, (outcome: any) => {
      tokenResponse = outcome;
      console.log(JSON.stringify(outcome))
      if (outcome.approved) {
        appleSession.completePayment(ApplePaySession.STATUS_SUCCESS)
      } else {
        appleSession.completePayment(ApplePaySession.STATUS_FAILURE)
      }
    })
  }
}

// call backend to send the Apple Pay Payload and return the transaction outcome
function performTransaction(
  details: ApplePayJS.ApplePayPayment,
  apiKey: string,
  callback: any
) {
  axios
    .post(
      BACKEND_URL_CONVERT_TOKEN,
      {
        details,
        apiKey,
      },
      {
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    )
    .then(function (response) {
      callback(response.data)
    })
}

// return the shipping methods available based on region
function getAvailableShippingMethods(_?: string) {
  return { methods: DEFAULT_CONFIG.shippingMethods }
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
  try {
    return ApplePaySession && ApplePaySession.canMakePayments();
  } catch(error) {
    console.log("Failed to get apple session validity " + error)
    return false;
  }

}

export { startApplePaySession, DEFAULT_CONFIG, applePayAvailable }
