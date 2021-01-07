import mocksApi, {
  CreateMockChargebackPayload,
  CreateMockWirePaymentPayload,
  CreateMockACHBankAccount,
} from '@/lib/mocksApi'

declare module 'vue/types/vue' {
  interface Vue {
    $mocksApi: {
      getInstance: any
      createMockChargeback: (payload: CreateMockChargebackPayload) => any
      createMockWirePayment: (payload: CreateMockWirePaymentPayload) => any
      createMockACHBankAccount: (payload: CreateMockACHBankAccount) => any
    }
  }
}

export default ({ store }: any, inject: any) => {
  const instance = mocksApi.getInstance()

  instance.interceptors.request.use(
    function (config) {
      store.commit('CLEAR_REQUEST_DATA')
      store.commit('SET_REQUEST_URL', `${config.baseURL}${config.url}`)
      store.commit('SET_REQUEST_PAYLOAD', config.data)

      if (store.state.bearerToken) {
        config.headers = { Authorization: `Bearer ${store.state.bearerToken}` }
      }
      return config
    },
    function (error) {
      return Promise.reject(error)
    }
  )

  instance.interceptors.response.use(
    function (response) {
      store.commit('SET_RESPONSE', response)
      return response
    },
    function (error) {
      return Promise.reject(error)
    }
  )

  inject('mocksApi', mocksApi)
}
