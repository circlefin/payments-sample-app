const applePaySecretsAreSet = !(
  process.env.APPLE_PAY_CERTIFICATE == null ||
  process.env.APPLE_PAY_PRIVATE_KEY == null ||
  process.env.APPLE_PAY_SESSION_VALIDATE_URL == null ||
  process.env.APPLE_PAY_PERFORM_PAY_URL == null
)

const merchantIdentityCertificate: string = applePaySecretsAreSet
  ? process.env.APPLE_PAY_CERTIFICATE!
  : ''
const merchantIdentityKey: string = applePaySecretsAreSet
  ? process.env.APPLE_PAY_PRIVATE_KEY!
  : ''

const sessionValidateUrl: string = applePaySecretsAreSet
  ? process.env.APPLE_PAY_SESSION_VALIDATE_URL!
  : ''

const payUrl: string = applePaySecretsAreSet
  ? process.env.APPLE_PAY_PERFORM_PAY_URL!
  : ''

export {
  merchantIdentityCertificate,
  merchantIdentityKey,
  sessionValidateUrl,
  payUrl,
}
