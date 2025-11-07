import axios, { type AxiosInstance } from 'axios'
import { getIsNotStagingOrSmokebox } from '@/lib/apiTarget'

class CircleWalletsApi {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: this.getCircleBaseUrl(),
      timeout: 60000,
    })
  }

  private getCircleBaseUrl(): string {
    // Use api.circle.com for production/sandbox, api-staging.circle.com for smokebox/staging
    return getIsNotStagingOrSmokebox()
      ? 'https://api.circle.com'
      : 'https://api-staging.circle.com'
  }

  getInstance(): AxiosInstance {
    return this.instance
  }

  updateBaseUrl() {
    this.instance.defaults.baseURL = this.getCircleBaseUrl()
  }

  /**
   * Get the public key for entity secret encryption
   * @param apiKey - Circle API key
   * @returns Public key PEM string
   */
  async getEntityPublicKey(apiKey: string): Promise<string> {
    const response = await this.instance.get(
      '/v1/w3s/config/entity/publicKey',
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data.data.publicKey
  }

  /**
   * Generate entity secret ciphertext using RSA-OAEP encryption
   * @param entitySecret - The entity secret (hex string)
   * @param publicKeyPem - The public key in PEM format
   * @returns Base64 encoded ciphertext
   */
  async generateEntitySecretCiphertext(
    entitySecret: string,
    publicKeyPem: string,
  ): Promise<string> {
    const publicKeyBuffer = this.pemToArrayBuffer(publicKeyPem)
    const publicKey = await crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt'],
    )

    // Convert hex entity secret to bytes
    const entitySecretBytes = this.hexToBytes(entitySecret)

    // Encrypt the entity secret
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      entitySecretBytes,
    )

    // Convert to base64
    const ciphertext = this.arrayBufferToBase64(encryptedData)
    return ciphertext
  }

  /**
   * Sign typed data using Circle's Developer Controlled Wallets API
   * @param walletId - The wallet ID to sign with
   * @param typedData - The EIP-712 typed data as a string
   * @param entitySecretCiphertext - The encrypted entity secret
   * @param apiKey - Circle API key
   * @returns Signature response
   */
  async signTypedData(
    walletId: string,
    typedData: string,
    entitySecretCiphertext: string,
    apiKey: string,
  ): Promise<any> {
    const response = await this.instance.post(
      '/v1/w3s/developer/sign/typedData',
      {
        walletId,
        data: typedData,
        entitySecretCiphertext,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  }

  /**
   * Complete flow: fetch public key, generate ciphertext, and sign typed data
   * @param walletId - The wallet ID to sign with
   * @param typedData - The EIP-712 typed data as a string
   * @param entitySecret - The entity secret (hex string)
   * @param apiKey - Circle API key
   * @returns Signature response
   */
  async signTypedDataComplete(
    walletId: string,
    typedData: string,
    entitySecret: string,
    apiKey: string,
  ): Promise<any> {
    const publicKeyPem = await this.getEntityPublicKey(apiKey)

    const entitySecretCiphertext = await this.generateEntitySecretCiphertext(
      entitySecret,
      publicKeyPem,
    )

    return await this.signTypedData(
      walletId,
      typedData,
      entitySecretCiphertext,
      apiKey,
    )
  }

  // Utility methods
  private pemToArrayBuffer(pem: string): ArrayBuffer {
    const pemHeader = '-----BEGIN PUBLIC KEY-----'
    const pemFooter = '-----END PUBLIC KEY-----'
    const pemContents = pem
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '')
    const binaryString = atob(pemContents)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  private hexToBytes(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
    }
    return bytes.buffer
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }
}

export default new CircleWalletsApi()
