import mocksApi from '@/lib/mocksApi'
import { createApiPlugin } from '~/plugins/apiPluginFactory'

export default createApiPlugin(() => mocksApi.getInstance(), 'mocksApi')
