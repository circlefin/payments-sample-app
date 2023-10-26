/**
 * Copyright 2023 Circle Internet Financial, LTD.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { createMessage, encrypt as pgpEncrypt, readKey } from 'openpgp'

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
  if (!publicKey || !keyId) {
    throw new Error('Unable to encrypt data')
  }

  const decodedPublicKey = await readKey({ armoredKey: atob(publicKey) })
  const message = await createMessage({ text: JSON.stringify(dataToEncrypt) })
  return pgpEncrypt({
    message,
    encryptionKeys: decodedPublicKey,
  }).then((ciphertext) => {
    return {
      encryptedMessage: btoa(ciphertext),
      keyId,
    }
  })
}

export default {
  encrypt,
}
