import memoize from 'memoizee';
import { createPublicClient, defineChain, http } from 'viem';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

import chainsDefinitions from './definitions';

export default memoize((networkEnvironment: NetworkEnvironment, chain: keyof typeof chainsDefinitions) => {
  const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chainsDefinitions[chain][networkEnvironment];

  return createPublicClient({
    chain: defineChain({
      id,
      name,
      nativeCurrency,
      rpcUrls,
      blockExplorers,
    }),
    transport: http(),
  });
});
