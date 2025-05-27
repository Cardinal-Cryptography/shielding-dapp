import { objectEntries } from 'tsafe';

import definitions from 'src/domains/chains/utils/definitions';
import isPresent from 'src/domains/misc/utils/isPresent';

export default (chainId: number | string) => {
  const configEntry = objectEntries(definitions)
    .flatMap(([chain, group]) =>
      objectEntries(group)
        .map(([, def]) => def)
        .filter(isPresent)
        .map(def => ({ ...def, chain }))
    )
    .find(({ id }) => id === chainId);

  if (!configEntry) {
    throw new Error(`Unable to find the config with id ${chainId}`);
  }

  return configEntry;
};
