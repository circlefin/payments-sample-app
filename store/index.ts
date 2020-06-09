import VuexPersist from 'vuex-persist'
import { MutationTree, GetterTree, ActionTree } from 'vuex'

const vuexPersist = new VuexPersist({
  key: 'payments-sandbox',
  storage: window.localStorage,
})

export const plugins = [vuexPersist.plugin]

interface Card {
  id: string
  cvvRequired: boolean
}

export interface StoreState {
  bearerToken: string
  apiRequest: {
    url: string
    payload: {}
    response: {}
  }
  cards: Card[]
  isMarketplace: boolean
}

export const state: () => StoreState = () => ({
  bearerToken: '',
  apiRequest: {
    url: '',
    payload: {},
    response: {},
  },
  cards: [],
  isMarketplace: false,
})

export type RootState = ReturnType<typeof state>

export const mutations: MutationTree<RootState> = {
  SET_BEARER_TOKEN(state, apiKey) {
    state.bearerToken = apiKey
  },
  SET_REQUEST_URL(state, url) {
    state.apiRequest.url = url
  },
  SET_REQUEST_PAYLOAD(state, payload) {
    if (!payload) {
      return
    }
    state.apiRequest.payload = payload
  },
  SET_RESPONSE(state, response) {
    state.apiRequest.response = response
  },
  CLEAR_REQUEST_DATA(state) {
    state.apiRequest = { url: '', payload: {}, response: {} }
  },
  SET_CARD(state, card: Card) {
    state.cards.push(card)
  },
  SET_IS_MARKETPLACE(state, bool) {
    state.isMarketplace = bool
  },
}

export const actions: ActionTree<RootState, RootState> = {
  setCard({ commit }, card) {
    commit('SET_CARD', card)
  },
}

export const getters: GetterTree<RootState, RootState> = {
  getApiKey: (state) => {
    return state.bearerToken
  },
  getRequestPayload: (state) => {
    return state.apiRequest.payload
  },
  getRequestResponse: (state) => {
    return state.apiRequest.response
  },
  getRequestUrl: (state) => {
    return state.apiRequest.url
  },
  getCards: (state) => {
    return state.cards
  },
  isMarketplace: (state) => {
    return state.isMarketplace
  },
}
