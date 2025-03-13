import memoize from 'memoizee';
import { createPublicClient, defineChain, http } from 'viem';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

import chainsDefinitions from '../definitions/definitions';

export default memoize((config?: {
  networkEnvironment: NetworkEnvironment,
  chain: keyof typeof chainsDefinitions,
}) => {

  const getChain = () => {
    if(!config) return undefined;
    return defineChain({
      ...chainsDefinitions[config.chain][config.networkEnvironment],
    });
  };

  return createPublicClient({
    chain: getChain(),
    transport: http(),
  });
});
