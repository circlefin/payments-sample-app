const applePaySecretsAreSet = !(process.env.apple_pay_certifcate == null || process.env.apple_pay_private_key == null)

const merchantIdentityCertificate: string = applePaySecretsAreSet ? process.env.apple_pay_certifcate! : ""
const merchantIdentityKey: string = applePaySecretsAreSet ? process.env.apple_pay_private_key! : ""

export { merchantIdentityCertificate, merchantIdentityKey }