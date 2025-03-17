import { ReturnType } from 'tsafe';

import { NetworkEnvironment } from 'src/domains/chains/types/misc';

import getQueriesConfigs from './getQueriesConfigs';

export default (
  networkEnvironment: NetworkEnvironment,
  queryName: keyof ReturnType<typeof getQueriesConfigs>,
  cacheKeySegment: unknown[],
) => ['CHAINS', networkEnvironment, queryName, ...cacheKeySegment];
