const applePaySecretsAreSet = !(
  process.env.APPLE_PAY_CERTIFICATE == null ||
  process.env.APPLE_PAY_PRIVATE_KEY == null
)

const merchantIdentityCertificate: string = applePaySecretsAreSet
  ? process.env.apple_pay_certifcate!
  : ''
const merchantIdentityKey: string = applePaySecretsAreSet
  ? process.env.apple_pay_private_key!
  : ''

export { merchantIdentityCertificate, merchantIdentityKey }
