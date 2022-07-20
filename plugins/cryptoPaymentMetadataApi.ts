import cryptoPaymentMetadataApi from '@/lib/cryptoPaymentMetadataApi'

declare module 'vue/types/vue' {
  interface Vue {
    $cryptoPaymentMetadataApi: {
      getSupportedCurrencyAndBlockchainCombinations: any
    }
  }
}

export default ({ store }: any, inject: any) => {
  const instance = cryptoPaymentMetadataApi.getInstance()

  instance.interceptors.request.use(
    function (config) {
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
      return response
    },
    function (error) {
      return Promise.reject(error)
    }
  )

  inject('cryptoPaymentMetadataApi', cryptoPaymentMetadataApi)
}
