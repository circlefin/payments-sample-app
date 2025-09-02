import cryptoPaymentMetadataApi from '@/lib/cryptoPaymentMetadataApi'

export default defineNuxtPlugin(() => {
  const { $pinia } = useNuxtApp()
  const store = useMainStore($pinia)

  const instance = cryptoPaymentMetadataApi.getInstance()

  instance.interceptors.request.use(
    function (config) {
      if (store.bearerToken) {
        config.headers.Authorization = `Bearer ${store.bearerToken}`
      }
      return config
    },
    function (error) {
      return Promise.reject(error)
    },
  )

  instance.interceptors.response.use(
    function (response) {
      return response
    },
    function (error) {
      return Promise.reject(error)
    },
  )

  return {
    provide: {
      cryptoPaymentMetadataApi: cryptoPaymentMetadataApi,
    },
  }
})
