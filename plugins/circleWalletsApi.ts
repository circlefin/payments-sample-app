import circleWalletsApi from '@/lib/circleWalletsApi'
import { createApiPlugin } from '~/plugins/apiPluginFactory'

export default createApiPlugin(() => circleWalletsApi.getInstance(), 'circleWalletsApi')
