import axios from 'axios'

// currently endpoints are used only in staging
const BACKEND_URL_VALIDATE_SESSION = 'https://sample-staging.circle.com/api/applePaySessionValidation'
const BACKEND_URL_PAY = 'https://sample-staging.circle.com/api/payWithApplePay'

// default configuration used in staging
const default_config = {
    payments: {
        acceptedCardSchemes: ['amex', 'masterCard', 'visa']
    },
    shop: {
        product_price: '10.0',
        shop_name: 'Demo Shop',
        shop_localisation: {
            currencyCode: 'USD',
            countryCode: 'US'
        }
    },
    shipping: {
        US_region: [{
            label: 'Free Shipping',
            amount: '0.00',
            detail: 'Arrives in 3-5 days',
            identifier: 'freeShipping'
        },
        {
            label: 'Express Shipping',
            amount: '5.00',
            detail: 'Arrives in 1-2 days',
            identifier: 'expressShipping'
        }
        ],
        WORLDWIDE_region: [{
            label: 'Worldwide Standard Shipping',
            amount: '10.00',
            detail: 'Arrives in 5-8 days',
            identifier: 'worldwideShipping'
        }]
    }
}

// call backend to send the Apple Pay Payload and return the transaction outcome
function performTransaction(details: ApplePayJS.ApplePayPayment, callback: any) {
    axios.post(
        BACKEND_URL_PAY,
        {
            details
        },
        {
            headers: { 'Access-Control-Allow-Origin': '*' }
        })
        .then(function (response) {
            callback(response.data)
        })
}

function getAvailableShippingMethods(region: string) {
    // return the shipping methods available based on region
    if (region === 'US') {
        return { methods: default_config.shipping.US_region }
    } else {
        return { methods: default_config.shipping.WORLDWIDE_region }
    }
}

function calculateTotal(subtotal: string, shipping: string) {
    return (parseFloat(subtotal) + parseFloat(shipping)).toFixed(2)
}

function handleApplePayEvents(appleSession: ApplePaySession) {
    // This is the first event that Apple triggers. Validate the Apple Pay Session from endpoint
    appleSession.onvalidatemerchant = function (event) {
        // get the validationURL and send it to server-side (the server-side will return some JSON)
        // complete validation by calling the appleSession.completeMerchantValidation(merchantSession), by passing the response from your server-side
        validateApplePaySession(event.validationURL, (merchantSession: any): void => appleSession.completeMerchantValidation(merchantSession))
    }

    // This method is triggered before populating the shipping methods
    appleSession.onshippingcontactselected = function (event) {
        // populate with the availbale shipping methods for the region (Apple will tell you the region).
        // while the full address will only be available to you after the user confirms tha payment
        var shipping = getAvailableShippingMethods(
            default_config.shop.shop_localisation.countryCode
        )
        // Update total and line items based on the shipping methods
        var newTotal: ApplePayJS.ApplePayLineItem = {
            type: 'final',
            label: default_config.shop.shop_name,
            amount: calculateTotal(
                default_config.shop.product_price,
                shipping.methods[0].amount
            )
        }
        var newLineItems: ApplePayJS.ApplePayLineItem[] = [
            {
                type: 'final',
                label: 'Subtotal',
                amount: default_config.shop.product_price
            },
            {
                type: 'final',
                label: shipping.methods[0].label,
                amount: shipping.methods[0].amount
            }]
        appleSession.completeShippingContactSelection(
            ApplePaySession.STATUS_SUCCESS, // ApplePaySession.STATUS_SUCCESS - indicates event was successfully handled
            shipping.methods, // list of shipping methods we want to offer
            newTotal, // shipping methods have different prices, we need to make sure that the total displayed in the Apple Pay pop-up is up to date
            newLineItems // for a great user experience you want to show the shipping method selected in the transaction summary of the Apple Pay pop-up
        )
    }

    // This method is triggered when a user select one of the shipping options.
    // Here you generally want to keep track of the transaction amount
    appleSession.onshippingmethodselected = function (event) {
        var newTotal: ApplePayJS.ApplePayLineItem = {
            type: 'final',
            label: default_config.shop.shop_name,
            amount: calculateTotal(
                default_config.shop.product_price,
                event.shippingMethod.amount
            )
        }
        var newLineItems: ApplePayJS.ApplePayLineItem[] = [
            {
                type: 'final',
                label: 'Subtotal',
                amount: default_config.shop.product_price
            },
            {
                type: 'final',
                label: event.shippingMethod.label,
                amount: event.shippingMethod.amount
            }]
        appleSession.completeShippingMethodSelection(
            ApplePaySession.STATUS_SUCCESS,
            newTotal, // updated total obtained by taking the product value and adding the shipping
            newLineItems // update order summary (so it reflects the name of the new payment method selected)
        )
    }

    // This method is the most important method. It gets triggered after the user has
    // confirmed the transaction with the Touch ID or Face ID. Besides getting all the
    // details about the customer (email, address ...) you also get the Apple Pay payload 
    // needed to perform a payment.
    appleSession.onpaymentauthorized = function (event) {
        performTransaction(event.payment, (outcome: any) => {
            if (outcome.approved) {
                appleSession.completePayment(ApplePaySession.STATUS_SUCCESS)
                console.log(outcome)
            } else {
                appleSession.completePayment(ApplePaySession.STATUS_FAILURE)
                console.log(outcome)
            }
        })
    }
}

// @param {string} appleUrl The Apple Pay validation URL generated by Apple
// @param {function} callback Callback function used to return the server call outcome
// @return {object} The session payload
function validateApplePaySession(appleUrl: string, callback: any): void {
    axios.post(
        BACKEND_URL_VALIDATE_SESSION,
        {
            appleUrl
        },
        {
            headers: { 'Access-Control-Allow-Origin': '*' }
        })
        .then(function (response) {
            callback(response.data)
        })
}

// Starts the Apple Pay session using a configuration
function startApplePaySession(config: any): void {
    var applePaySession = new ApplePaySession(6, config)
    handleApplePayEvents(applePaySession)
    applePaySession.begin()
}

function applePayAvailable(): boolean {
    return ApplePaySession && ApplePaySession.canMakePayments()
    // canMakePaymentsWithActiveCard(merchantIdentifier: string):
}

export { startApplePaySession, default_config, applePayAvailable }
