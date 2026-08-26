import { defineStore } from 'pinia'

interface ApiRequest {
  url: string
  payload: any
  response: any
}

export interface DelegateFundingEntry {
  contractTradeId: string
  traderTypedData: any
  funderTypedData: any
  traderSignature: string
  funderSignature: string
}

interface MainState {
  bearerToken: string
  walletApiKey: string
  entitySecret: string
  walletId: string
  funderWalletId: string
  apiRequest: ApiRequest
  delegateFundingBatch: DelegateFundingEntry[]
}

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    bearerToken:
      typeof window !== 'undefined'
        ? localStorage.getItem('bearerToken') || ''
        : '',
    walletApiKey:
      typeof window !== 'undefined'
        ? localStorage.getItem('walletApiKey') || ''
        : '',
    entitySecret:
      typeof window !== 'undefined'
        ? localStorage.getItem('entitySecret') || ''
        : '',
    walletId:
      typeof window !== 'undefined'
        ? localStorage.getItem('walletId') || ''
        : '',
    funderWalletId:
      typeof window !== 'undefined'
        ? localStorage.getItem('funderWalletId') || ''
        : '',
    apiRequest: {
      url: '',
      payload: {},
      response: {},
    },
    delegateFundingBatch: [],
  }),

  getters: {
    getApiKey: (state): string => state.bearerToken,
    getWalletApiKey: (state): string => state.walletApiKey,
    getEntitySecret: (state): string => state.entitySecret,
    getWalletId: (state): string => state.walletId,
    getFunderWalletId: (state): string => state.funderWalletId,
    getRequestPayload: (state): any => state.apiRequest.payload,
    getRequestResponse: (state): any => state.apiRequest.response,
    getRequestUrl: (state): string => state.apiRequest.url,
    getDelegateFundingBatch: (state): DelegateFundingEntry[] =>
      state.delegateFundingBatch,
  },

  actions: {
    setBearerToken(apiKey: string) {
      this.bearerToken = apiKey
      if (typeof window !== 'undefined') {
        localStorage.setItem('bearerToken', apiKey)
      }
    },

    setWalletApiKey(walletApiKey: string) {
      this.walletApiKey = walletApiKey
      if (typeof window !== 'undefined') {
        localStorage.setItem('walletApiKey', walletApiKey)
      }
    },

    setEntitySecret(entitySecret: string) {
      this.entitySecret = entitySecret
      if (typeof window !== 'undefined') {
        localStorage.setItem('entitySecret', entitySecret)
      }
    },

    setWalletId(walletId: string) {
      this.walletId = walletId
      if (typeof window !== 'undefined') {
        localStorage.setItem('walletId', walletId)
      }
    },

    setFunderWalletId(funderWalletId: string) {
      this.funderWalletId = funderWalletId
      if (typeof window !== 'undefined') {
        localStorage.setItem('funderWalletId', funderWalletId)
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

    setDelegateFundingBatch(batch: DelegateFundingEntry[]) {
      this.delegateFundingBatch = batch
    },

    clearDelegateFundingBatch() {
      this.delegateFundingBatch = []
    },
  },

  persist: {
    key: 'payments-sandbox',
  },
})
