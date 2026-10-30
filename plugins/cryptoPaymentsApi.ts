import cryptoPaymentsApi from '@/lib/cryptoPaymentsApi'
import { createApiPlugin } from '~/plugins/apiPluginFactory'

export default createApiPlugin(() => cryptoPaymentsApi.getInstance(), 'cryptoPaymentsApi')
