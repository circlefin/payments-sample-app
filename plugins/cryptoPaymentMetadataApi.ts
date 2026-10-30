import cryptoPaymentMetadataApi from '@/lib/cryptoPaymentMetadataApi'
import { createApiPlugin } from '~/plugins/apiPluginFactory'

export default createApiPlugin(() => cryptoPaymentMetadataApi.getInstance(), 'cryptoPaymentMetadataApi')
