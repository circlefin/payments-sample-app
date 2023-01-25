import get from 'lodash/get'
import axios from 'axios'

import { mainnet } from '@wagmi/core/chains'
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
  const { chains, provider, webSocketProvider } = configureChains(
    [mainnet],
    [publicProvider()]
  )

  const client = createClient({
    provider,
    webSocketProvider,
    connectors: [new MetaMaskConnector({ chains })],
  })
}

/**
 * Send presign data to Metamask
 * @param presignedData
 */
async function sendPresignedDataToMetaMask({ typedData }: any) {
  startWagmiClient()
  await connect({
    connector: new MetaMaskConnector(),
  })
  const { domain, types, message: value } = typedData
  const signature = await signTypedData({ domain, types, value })
}

export { sendPresignedDataToMetaMask }
