import paymentsApi from '@/lib/paymentsApi'
import { createApiPlugin } from '~/plugins/apiPluginFactory'

export default createApiPlugin(() => paymentsApi.getInstance(), 'paymentsApi')
