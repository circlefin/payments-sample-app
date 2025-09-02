import paymentsApi from '@/lib/paymentsApi'

export default defineNuxtPlugin(() => {
  const store = useMainStore()
  const instance = paymentsApi.getInstance()

  instance.interceptors.request.use(
    function (config) {
      store.clearRequestData()
      store.setRequestUrl(`${config.baseURL}${config.url}`)
      store.setRequestPayload(config.data)

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
      store.setResponse(response)
      return response
    },
    function (error) {
      return Promise.reject(error)
    },
  )

  return {
    provide: {
      paymentsApi: paymentsApi,
    },
  }
})
