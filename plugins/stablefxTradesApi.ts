import stablefxTradesApi from '@/lib/stablefxTradesApi'
import { createApiPlugin } from '~/plugins/apiPluginFactory'

export default createApiPlugin(() => stablefxTradesApi.getInstance(), 'stablefxTradesApi')
