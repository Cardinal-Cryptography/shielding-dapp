import { objectEntries, objectFromEntries, ReturnType } from 'tsafe';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';
import queryClient from 'src/domains/misc/utils/queryClient';

import composeCacheKey from '../queriesParams/composeCacheKey';

import getMutationsConfigs from './getMutationsConfigs';

type MutationsConfigs = ReturnType<typeof getMutationsConfigs>;

const mutationsParams: Record<NetworkEnvironment, {
  [Mutation in keyof MutationsConfigs]: (...params: Parameters<MutationsConfigs[Mutation]>) => {
    mutationFn: ReturnType<MutationsConfigs[Mutation]>['mutationFn'],
    onSuccess: () => unknown,
  }
}> = objectFromEntries((['mainnet', 'testnet'] as const).map(networkEnvironment => [
  networkEnvironment,
  objectFromEntries(
    objectEntries(getMutationsConfigs(networkEnvironment)).map(([mutationName, getMutationParams]) => [
      mutationName,
      (...params: Parameters<typeof getMutationParams>) => {
        const { mutationFn, cacheKeysSegmentsToInvalidate } = getMutationParams(...params as [never]);

        return {
          mutationFn,
          onSuccess: () => {
            cacheKeysSegmentsToInvalidate.forEach(
              cacheKeySegment => void queryClient.invalidateQueries({
                queryKey: composeCacheKey(networkEnvironment, 'tokenBalanceOnAccount', cacheKeySegment),
              })
            );
          },
        };
      },
    ])
  ),
]));

export default mutationsParams;
