const merchantId: string =
  process.env.GOOGLE_PAY_PAYFAC_MERCHANT_ID != null
    ? process.env.GOOGLE_PAY_PAYFAC_MERCHANT_ID!
    : ''

const merchantName: string =
  process.env.GOOGLE_PAY_PAYFAC_MERCHANT_NAME != null
    ? process.env.GOOGLE_PAY_PAYFAC_MERCHANT_NAME!
    : ''

const checkoutKey: string =
  process.env.GOOGLE_PAY_PAYFAC_CHECKOUT_KEY != null
    ? process.env.GOOGLE_PAY_PAYFAC_CHECKOUT_KEY!
    : ''

export { merchantId, merchantName, checkoutKey }
