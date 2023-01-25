import get from 'lodash/get'
import axios from 'axios'

import { mainnet, goerli } from '@wagmi/core/chains'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { InjectedConnector } from '@wagmi/core/connectors/injected'

import {
  connect,
  createClient,
  configureChains,
  signTypedData,
} from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'
import { getAPIHostname } from './apiTarget'

function startWagmiClient() {
  const { provider, webSocketProvider } = configureChains(
    [mainnet, goerli],
    [publicProvider()]
  )

  const client = createClient({
    provider,
    webSocketProvider,
    connectors: [],
  })
}

/**
 * Send presign data to Metamask
 * @param presignedData
 */
async function sendPresignedDataToMetaMask({ typedData }: any) {
  startWagmiClient()
  await connect({
    connector: new MetaMaskConnector({
      chains: [goerli, mainnet],
      options: {
        shimChainChangedDisconnect: true,
        shimDisconnect: true,
      },
    }),
  })
  const { domain, types, message: value } = typedData
  const signature = await signTypedData({ domain, types, value })
}

export { sendPresignedDataToMetaMask }
