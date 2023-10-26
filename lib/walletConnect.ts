/**
 * Copyright 2023 Circle Internet Financial, LTD.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { mainnet, goerli } from '@wagmi/core/chains'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'

/*eslint-disable */
import {
  connect,
  createClient,
  configureChains,
  signTypedData,
} from '@wagmi/core' // TODO: Throws parser error, fix eslint configuration
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
