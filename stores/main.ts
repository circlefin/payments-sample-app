import { defineStore } from 'pinia'

interface ApiRequest {
  url: string
  payload: any
  response: any
}

interface MainState {
  bearerToken: string
  apiRequest: ApiRequest
}

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    bearerToken:
      typeof window !== 'undefined'
        ? sessionStorage.getItem('bearerToken') || ''
        : '',
    apiRequest: {
      url: '',
      payload: {},
      response: {},
    },
  }),

  getters: {
    getApiKey: (state): string => state.bearerToken,
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
