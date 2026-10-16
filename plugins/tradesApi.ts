import tradesApi from '@/lib/tradesApi'
import { createApiPlugin } from '~/plugins/apiPluginFactory'

export default createApiPlugin(() => tradesApi.getInstance(), 'tradesApi')
