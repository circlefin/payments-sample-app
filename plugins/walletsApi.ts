import walletsApi from '@/lib/walletsApi'
import { createApiPlugin } from '~/plugins/apiPluginFactory'

export default createApiPlugin(() => walletsApi.getInstance(), 'walletsApi')
