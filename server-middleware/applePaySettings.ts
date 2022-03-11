const applePaySecretsAreSet = !(
  process.env.APPLE_PAY_PAYFAC_CERTIFICATE == null ||
  process.env.APPLE_PAY_PAYFAC_PRIVATE_KEY == null ||
  process.env.APPLE_PAY_PARTNERSHIP_CERTIFICATE == null ||
  process.env.APPLE_PAY_PARTNERSHIP_PRIVATE_KEY == null
)

const payfacMerchantIdentityCertificate: string = applePaySecretsAreSet
  ? process.env.APPLE_PAY_PAYFAC_CERTIFICATE!
  : ''
const payfacMerchantIdentityKey: string = applePaySecretsAreSet
  ? process.env.APPLE_PAY_PAYFAC_PRIVATE_KEY!
  : ''
const partnershipMerchantIdentityCertificate: string = applePaySecretsAreSet
  ? process.env.APPLE_PAY_PARTNERSHIP_CERTIFICATE!
  : ''
const partnershipMerchantIdentityKey: string = applePaySecretsAreSet
  ? process.env.APPLE_PAY_PARTNERSHIP_PRIVATE_KEY!
  : ''

const domainValidation: string = applePaySecretsAreSet
  ? process.env.APPLE_PAY_DOMAIN_VERIFICATION!
  : ''

export {
  payfacMerchantIdentityCertificate,
  payfacMerchantIdentityKey,
  domainValidation,
  partnershipMerchantIdentityCertificate,
  partnershipMerchantIdentityKey,
}
