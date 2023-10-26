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
