const payfacMerchantIdentityCertificate: string =
  process.env.APPLE_PAY_PAYFAC_CERTIFICATE != null
    ? process.env.APPLE_PAY_PAYFAC_CERTIFICATE!
    : ''
const payfacMerchantIdentityKey: string =
  process.env.APPLE_PAY_PAYFAC_PRIVATE_KEY != null
    ? process.env.APPLE_PAY_PAYFAC_PRIVATE_KEY!
    : ''
const partnershipMerchantIdentityCertificate: string =
  process.env.APPLE_PAY_PARTNERSHIP_CERTIFICATE != null
    ? process.env.APPLE_PAY_PARTNERSHIP_CERTIFICATE!
    : ''
const partnershipMerchantIdentityKey: string =
  process.env.APPLE_PAY_PARTNERSHIP_PRIVATE_KEY != null
    ? process.env.APPLE_PAY_PARTNERSHIP_PRIVATE_KEY!
    : ''

const domainValidation: string =
  process.env.APPLE_PAY_DOMAIN_VERIFICATION != null
    ? process.env.APPLE_PAY_DOMAIN_VERIFICATION!
    : ''

const partnershipMerchantId: string =
  process.env.APPLE_PAY_PARTNERSHIP_MERCHANT_ID != null
    ? process.env.APPLE_PAY_PARTNERSHIP_MERCHANT_ID!
    : ''

const payfacMerchantId: string =
  process.env.APPLE_PAY_PAYFAC_MERCHANT_ID != null
    ? process.env.APPLE_PAY_PAYFAC_MERCHANT_ID!
    : ''

export {
  payfacMerchantIdentityCertificate,
  payfacMerchantIdentityKey,
  domainValidation,
  partnershipMerchantIdentityCertificate,
  partnershipMerchantIdentityKey,
  partnershipMerchantId,
  payfacMerchantId,
}
