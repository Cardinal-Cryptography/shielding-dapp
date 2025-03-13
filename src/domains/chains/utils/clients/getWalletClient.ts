import memoize from 'memoizee';
import { createWalletClient, custom, defineChain } from 'viem';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

import chainsDefinitions from '../definitions/definitions';

import getEthereumProvider from './getEthereumProvider';

export default memoize(async (config?: {
  networkEnvironment: NetworkEnvironment,
  chain: keyof typeof chainsDefinitions,
}) => {
  const provider = await getEthereumProvider();

  const getChain = () => {
    if(!config) return undefined;
    return defineChain({
      ...chainsDefinitions[config.chain][config.networkEnvironment],
    });
  };

  return createWalletClient({
    chain: getChain(),
    transport: custom(provider),
  });
});
