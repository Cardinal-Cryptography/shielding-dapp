import memoize from 'memoizee';
import { createWalletClient, custom, defineChain } from 'viem';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

import chainsDefinitions from '../definitions';

import getEthereumProvider from './getEthereumProvider';

async function getWalletClient(): Promise<ReturnType<typeof createWalletClient>>;
async function getWalletClient(
  networkEnvironment: NetworkEnvironment,
  chain: keyof typeof chainsDefinitions
): Promise<ReturnType<typeof createWalletClient>>;

async function getWalletClient(
  networkEnvironment?: NetworkEnvironment,
  chain?: keyof typeof chainsDefinitions
) {
  const provider = await getEthereumProvider();

  return createWalletClient({
    chain: networkEnvironment && chain ?
      defineChain({
        ...chainsDefinitions[chain][networkEnvironment],
      }) :
      undefined,
    transport: custom(provider),
  });
}

export default memoize(getWalletClient, { primitive: true });
