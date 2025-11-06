import { defineStore } from 'pinia'

interface ApiRequest {
  url: string
  payload: any
  response: any
}

interface MainState {
  bearerToken: string
  walletApiKey: string
  entitySecret: string
  walletId: string
  apiRequest: ApiRequest
}

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    bearerToken:
      typeof window !== 'undefined'
        ? sessionStorage.getItem('bearerToken') || ''
        : '',
    walletApiKey:
      typeof window !== 'undefined'
        ? sessionStorage.getItem('walletApiKey') || ''
        : '',
    entitySecret:
      typeof window !== 'undefined'
        ? sessionStorage.getItem('entitySecret') || ''
        : '',
    walletId:
      typeof window !== 'undefined'
        ? sessionStorage.getItem('walletId') || ''
        : '',
    apiRequest: {
      url: '',
      payload: {},
      response: {},
    },
  }),

  getters: {
    getApiKey: (state): string => state.bearerToken,
    getWalletApiKey: (state): string => state.walletApiKey,
    getEntitySecret: (state): string => state.entitySecret,
    getWalletId: (state): string => state.walletId,
    getRequestPayload: (state): any => state.apiRequest.payload,
    getRequestResponse: (state): any => state.apiRequest.response,
    getRequestUrl: (state): string => state.apiRequest.url,
  },

  actions: {
    setBearerToken(apiKey: string) {
      this.bearerToken = apiKey
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bearerToken', apiKey)
      }
    },

    setWalletApiKey(walletApiKey: string) {
      this.walletApiKey = walletApiKey
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('walletApiKey', walletApiKey)
      }
    },

    setEntitySecret(entitySecret: string) {
      this.entitySecret = entitySecret
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('entitySecret', entitySecret)
      }
    },

    setWalletId(walletId: string) {
      this.walletId = walletId
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('walletId', walletId)
      }
    },

    setRequestUrl(url: string) {
      this.apiRequest.url = url
    },

    setRequestPayload(payload: any) {
      if (!payload) {
        return
      }
      this.apiRequest.payload = payload
    },

    setResponse(response: any) {
      this.apiRequest.response = response
    },

    clearRequestData() {
      this.apiRequest = { url: '', payload: {}, response: {} }
    },
  },

  persist: {
    key: 'payments-sandbox',
  },
})
