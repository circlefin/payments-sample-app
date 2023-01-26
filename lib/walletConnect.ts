import { mainnet, goerli } from '@wagmi/core/chains'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'

/*eslint-disable */
import {
  connect,
  createClient,
  configureChains,
  signTypedData,
} from '@wagmi/core' // TODO: Throws error, fix eslint configuration. See: https://circlefin.slack.com/archives/C043ETDAAJC/p1674678738355329?thread_ts=1674514103.077649&cid=C043ETDAAJC
/* eslint-enable */

import { publicProvider } from '@wagmi/core/providers/public'

function startWagmiClient() {
  const { provider, webSocketProvider } = configureChains(
    [mainnet, goerli],
    [publicProvider()]
  )

  createClient({
    provider,
    webSocketProvider,
    connectors: [],
  })
}

/**
 * Send presign data to Metamask
 * @param presignedData
 */
async function sendPresignedDataToMetaMask({
  domain,
  types,
  message: value,
}: any) {
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
  return await signTypedData({ domain, types, value })
}

export { sendPresignedDataToMetaMask }
