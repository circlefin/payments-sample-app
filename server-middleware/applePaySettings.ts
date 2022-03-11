const applePaySecretsAreSet = !(
  process.env.APPLE_PAY_CERTIFICATE == null ||
  process.env.APPLE_PAY_PRIVATE_KEY == null
)

const merchantIdentityCertificate: string = applePaySecretsAreSet
  ? process.env.APPLE_PAY_CERTIFICATE!
  : ''
const merchantIdentityKey: string = applePaySecretsAreSet
  ? process.env.APPLE_PAY_PRIVATE_KEY!
  : ''

const domainValidation: string = applePaySecretsAreSet
  ? process.env.APPLE_PAY_DOMAIN_VERIFICATION!
  : ''

const apiUrl: string = process.env.WALLETS_API || 'https://api-staging.circle.com'

export { apiUrl, merchantIdentityCertificate, merchantIdentityKey, domainValidation }
