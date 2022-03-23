import axios from 'axios'
import { getIsStaging } from '~/lib/apiTarget'

// endpoints are hardcoded as they are used only in staging
const BACKEND_URL_VALIDATE_SESSION = getIsStaging()
  ? 'https://sample-staging.circle.com/api/applepay/validate'
  : 'https://sample.circle.com/api/applepay/validate'
const BACKEND_URL_PAY = getIsStaging()
  ? 'https://sample-staging.circle.com/api/applepay/pay'
  : 'https://sample.circle.com/api/applepay/pay'

// default configuration used in staging
const DEFAULT_CONFIG = {
  payments: {
    currencyCode: 'USD',
    countryCode: 'US',
    merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
    supportedNetworks: ['amex', 'masterCard', 'visa'],
    shippingType: 'shipping',
    requiredBillingContactFields: ['postalAddress', 'name', 'phone', 'email'],
    requiredShippingContactFields: ['postalAddress', 'name', 'phone', 'email'],
    total: {
      label: 'Demo Shop',
      amount: '0.5',
      type: 'final',
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

const AUTOGEN_TOKEN_LENGTH = {
  data: 40,
  signature: 40,
  ephemeralPublicKey: 40,
  publicKeyHash: 40,
  transactionId: 40,
}

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

interface PaymentDetails {
  shopName: string
  lineItemType: ApplePayJS.ApplePayLineItemType
  amount: string
}

const inputConfig = {} as PaymentDetails

// Starts the Apple Pay session to pay on backend, registers event handlers
function startApplePaySessionBackendPay(
  config: any,
  apiKey: string,
  merchantType: string
): void {
  const applePaySession: ApplePaySession = new ApplePaySession(6, config)
  handleCommonApplePayEvents(applePaySession, merchantType)
  handleApplePayPaymentOnBackendEvent(applePaySession, apiKey)
  applePaySession.begin()
}

function startApplePaySessionFrontendPay(
  config: any,
  tokenObject: PaymentToken,
  merchantType: string,
  whenDone: any
): void {
  inputConfig.shopName = config.total.label
  inputConfig.lineItemType = config.total.type
  inputConfig.amount = config.total.amount
  const applePaySession: ApplePaySession = new ApplePaySession(6, config)
  handleCommonApplePayEvents(applePaySession, merchantType)
  handleApplePayPaymentOnFrontendEvent(applePaySession, tokenObject, whenDone)
  applePaySession.begin()
}

// Registers event handlers. There are 5 steps associated with Apple Pay, transition between steps triggers event, these events are:
// onvalidatemerchant, onshippingcontactselected, onshippingmethodselected, completeShippingMethodSelection and onpaymentauthorized.
function handleCommonApplePayEvents(
  appleSession: ApplePaySession,
  merchantType: string
) {
  // This is the first event that Apple triggers. Validate the Apple Pay Session from endpoint.
  appleSession.onvalidatemerchant = function (
    event: ApplePayJS.ApplePayValidateMerchantEvent
  ) {
    // Gets the validationURL at Apple Pay servers from client and sends it to endpoint here (at sample-app) at /applepay/validate.
    // complete validation by calling the appleSession.completeMerchantValidation(merchantSession), by passing the json response we got from Apple.
    validateApplePaySession(
      event.validationURL,
      merchantType,
      (merchantSession: any): void => {
        console.log('received session validation response')
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
      type: inputConfig.lineItemType,
      label: inputConfig.shopName,
      amount: calculateTotal(inputConfig.amount, shipping.methods[0].amount),
    }
    const newLineItems: ApplePayJS.ApplePayLineItem[] = [
      {
        type: inputConfig.lineItemType,
        label: 'Subtotal',
        amount: inputConfig.amount,
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
      type: inputConfig.lineItemType,
      label: inputConfig.shopName,
      amount: calculateTotal(inputConfig.amount, event.shippingMethod.amount),
    }
    const newLineItems: ApplePayJS.ApplePayLineItem[] = [
      {
        type: inputConfig.lineItemType,
        label: 'Subtotal',
        amount: inputConfig.amount,
      },
      {
        type: inputConfig.lineItemType,
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
}

// Final event which performs debit. Triggered after the user has confirmed the transaction with the Touch ID or Face ID.
// All details about the customer are provided and most importantly we get the Apple Pay token in payload needed to perform a payment.
function handleApplePayPaymentOnBackendEvent(
  appleSession: ApplePaySession,
  apiKey: string
) {
  appleSession.onpaymentauthorized = function (
    event: ApplePayJS.ApplePayPaymentAuthorizedEvent
  ) {
    console.log('received authorization')
    console.log(event.payment)
    console.log(JSON.stringify(event.payment.token))
    performTransaction(event.payment, apiKey, (outcome: any) => {
      console.log('received response from pay')
      console.log(JSON.stringify(outcome))
      console.log(outcome.logs)
      if (outcome.approved) {
        appleSession.completePayment(ApplePaySession.STATUS_SUCCESS)
      } else {
        appleSession.completePayment(ApplePaySession.STATUS_FAILURE)
      }
    })
  }
}

function handleApplePayPaymentOnFrontendEvent(
  appleSession: ApplePaySession,
  tokenObject: PaymentToken,
  whenDone: any
) {
  appleSession.onpaymentauthorized = function (
    event: ApplePayJS.ApplePayPaymentAuthorizedEvent
  ) {
    console.log('received authorization')
    console.log(event.payment)
    console.log(JSON.stringify(event.payment.token))
    const tokens = event.payment.token
    tokenObject.version = tokens.paymentData.version
    tokenObject.data = tokens.paymentData.data
    tokenObject.signature = tokens.paymentData.signature
    tokenObject.header = tokens.paymentData.header
    appleSession.completePayment(ApplePaySession.STATUS_SUCCESS)
    whenDone()
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
      BACKEND_URL_PAY,
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
  return { methods: DEFAULT_CONFIG.shipping.WORLDWIDE_region }
}

function calculateTotal(subtotal: string, shipping: string) {
  return (parseFloat(subtotal) + parseFloat(shipping)).toFixed(2)
}

// @param {string} appleUrl The Apple Pay validation URL generated by Apple
// @param {function} callback Callback function used to return the server call outcome
// @return {object} The session payload
function validateApplePaySession(
  appleUrl: string,
  merchantType: string,
  callback: any
): void {
  axios
    .post(
      BACKEND_URL_VALIDATE_SESSION,
      {
        appleUrl,
        merchantType,
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
    return ApplePaySession && ApplePaySession.canMakePayments()
  } catch (error) {
    console.log('Failed to get apple session validity ' + error)
    return false
  }
}

export {
  startApplePaySessionBackendPay,
  startApplePaySessionFrontendPay,
  DEFAULT_CONFIG,
  applePayAvailable,
  PaymentToken,
  PaymentDetails,
  AUTOGEN_TOKEN_LENGTH,
}
