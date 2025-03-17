import { objectEntries, objectFromEntries, ReturnType } from 'tsafe';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

import composeCacheKey from './composeCacheKey';
import getQueriesConfigs from './getQueriesConfigs';

type QueriesConfigs = ReturnType<typeof getQueriesConfigs>;

const queriesParams: Record<NetworkEnvironment, {
  [Query in keyof QueriesConfigs]: (...params: Parameters<QueriesConfigs[Query]>) => {
    queryFn: ReturnType<QueriesConfigs[Query]>['queryFn'],
    queryKey: unknown[],
  }
}> = objectFromEntries((['mainnet', 'testnet'] as const).map(networkEnvironment => [
  networkEnvironment,
  objectFromEntries(
    objectEntries(getQueriesConfigs(networkEnvironment)).map(([queryName, getQueryParams]) => [
      queryName,
      (...params: Parameters<typeof getQueryParams>) => {
        const { queryFn, cacheKeySegment } = getQueryParams(...params as [never]);

        return {
          queryFn,
          queryKey: composeCacheKey(networkEnvironment, queryName, cacheKeySegment),
        };
      },
    ])
  ),
]));

export default queriesParams;
