const googlePaySecretsAreSet = !(
  process.env.GOOGLE_PAY_PAYFAC_MERCHANT_ID == null ||
  process.env.GOOGLE_PAY_PAYFAC_MERCHANT_NAME == null ||
  process.env.GOOGLE_PAY_PAYFAC_CHECKOUT_KEY == null
)

const merchantId: string = googlePaySecretsAreSet
  ? process.env.GOOGLE_PAY_PAYFAC_MERCHANT_ID!
  : ''

const merchantName: string = googlePaySecretsAreSet
  ? process.env.GOOGLE_PAY_PAYFAC_MERCHANT_NAME!
  : ''

const checkoutKey: string = googlePaySecretsAreSet
  ? process.env.GOOGLE_PAY_PAYFAC_CHECKOUT_KEY!
  : ''

export { merchantId, merchantName, checkoutKey }
