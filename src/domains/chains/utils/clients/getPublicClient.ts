import memoize from 'memoizee';
import { createPublicClient, defineChain, http } from 'viem';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

import chainsDefinitions from '../definitions';

const getPublicClient = memoize(
  (networkEnvironment: NetworkEnvironment, chain: keyof typeof chainsDefinitions) =>
    createPublicClient({
      chain: defineChain({
        ...chainsDefinitions[chain][networkEnvironment],
      }),
      transport: http(),
    }),
  { primitive: true }
);

export default getPublicClient;
