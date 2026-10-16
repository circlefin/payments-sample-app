import payoutsApi from '@/lib/payoutsApi'
import { createApiPlugin } from '~/plugins/apiPluginFactory'

export default createApiPlugin(() => payoutsApi.getInstance(), 'payoutsApi')
