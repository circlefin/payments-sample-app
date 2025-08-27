import { defineStore } from 'pinia'

interface Card {
  id: string
  cvvRequired: boolean
}

interface ApiRequest {
  url: string
  payload: any
  response: any
}

interface MainState {
  bearerToken: string
  apiRequest: ApiRequest
  cards: Card[]
  isMarketplace: boolean
}

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    bearerToken: '',
    apiRequest: {
      url: '',
      payload: {},
      response: {},
    },
    cards: [],
    isMarketplace: false,
  }),

  getters: {
    getApiKey: (state): string => state.bearerToken,
    getRequestPayload: (state): any => state.apiRequest.payload,
    getRequestResponse: (state): any => state.apiRequest.response,
    getRequestUrl: (state): string => state.apiRequest.url,
    getCards: (state): Card[] => state.cards,
  },

  actions: {
    setBearerToken(apiKey: string) {
      this.bearerToken = apiKey
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

    setCard(card: Card) {
      this.cards.push(card)
    },

    setIsMarketplace(bool: boolean) {
      this.isMarketplace = bool
    },
  },

  persist: {
    key: 'payments-sandbox',
  },
})
