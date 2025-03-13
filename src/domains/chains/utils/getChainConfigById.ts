import { objectEntries } from 'tsafe';

import definitions from 'src/domains/chains/utils/definitions';

export default (chainId: number | string) => {
  const configEntry = objectEntries(definitions)
    .flatMap(([chain, chainGroup]) =>
      objectEntries(chainGroup).flatMap(([_, definition]) => ({ ...definition, chain }))
    )
    .find(({ id }) => id === chainId);

  if (!configEntry) {
    throw new Error(`Unable to find the config with id ${chainId}`);
  }

  return configEntry;
};
