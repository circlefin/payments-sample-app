import mocksApi from '@/lib/mocksApi'

export default defineNuxtPlugin(() => {
  const { $pinia } = useNuxtApp()
  const store = useMainStore($pinia)

  const instance = mocksApi.getInstance()

  instance.interceptors.request.use(
    function (config) {
      store.clearRequestData()
      store.setRequestUrl(`${config.baseURL}${config.url}`)
      store.setRequestPayload(config.data)

      if (store.bearerToken) {
        config.headers = { Authorization: `Bearer ${store.bearerToken}` }
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
      mocksApi: mocksApi,
    },
  }
})
