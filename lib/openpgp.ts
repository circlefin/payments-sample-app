// lazily load openpgp
const openpgpModule = import(
  /* webpackChunkName: "openpgp,  webpackPrefetch: true" */ 'openpgp'
)

interface PublicKey {
  keyId: string
  publicKey: string
}

/**
 * Encrypt dataToEncrypt
 *
 * @param {Object} dataToEncrypt
 * @param {PublicKey} Object containing keyId and publicKey properties
 *
 * @return {Object} Object containing encryptedMessage and keyId
 */
async function encrypt(dataToEncrypt: object, { keyId, publicKey }: PublicKey) {
  const decodedPublicKey = atob(publicKey)
  const openpgp = await openpgpModule
  const options = {
    message: openpgp.message.fromText(JSON.stringify(dataToEncrypt)),
    publicKeys: (await openpgp.key.readArmored(decodedPublicKey)).keys,
  }

  return openpgp.encrypt(options).then((ciphertext) => {
    return {
      encryptedMessage: btoa(ciphertext.data),
      keyId,
    }
  })
}

export default {
  encrypt,
}
