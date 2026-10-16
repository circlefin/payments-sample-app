import paymentIntentsApi from '@/lib/paymentIntentsApi'
import { createApiPlugin } from '~/plugins/apiPluginFactory'

export default createApiPlugin(() => paymentIntentsApi.getInstance(), 'paymentIntentsApi')
