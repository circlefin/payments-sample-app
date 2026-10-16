import settlementsApi from '@/lib/settlementsApi'
import { createApiPlugin } from '~/plugins/apiPluginFactory'

export default createApiPlugin(() => settlementsApi.getInstance(), 'settlementsApi')
