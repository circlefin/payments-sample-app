import { daaInstance } from '@/lib/daa/client'
import accountsApi from '@/lib/daa/accountsApi'
import wiresApi from '@/lib/daa/wiresApi'
import transfersApi from '@/lib/daa/transfersApi'
import transactionsApi from '@/lib/daa/transactionsApi'
import depositsApi from '@/lib/daa/depositsApi'
import withdrawalsApi from '@/lib/daa/withdrawalsApi'
import addressesApi from '@/lib/daa/addressesApi'
import earnApi from '@/lib/daa/earnApi'

export default defineNuxtPlugin(() => {
  const { $pinia } = useNuxtApp()
  const store = useMainStore($pinia)

  daaInstance.interceptors.request.use(
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

  daaInstance.interceptors.response.use(
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
      daaAccountsApi: accountsApi,
      daaTransactionsApi: transactionsApi,
      daaWiresApi: wiresApi,
      daaTransfersApi: transfersApi,
      daaDepositsApi: depositsApi,
      daaWithdrawalsApi: withdrawalsApi,
      daaAddressesApi: addressesApi,
      daaEarnApi: earnApi,
    },
  }
})
