import { objectEntries } from 'tsafe';

import definitions from 'src/domains/chains/utils/definitions';
import useChain from 'src/domains/chains/utils/useChain';

export default () => {
  const connectedChain = useChain();
  if (!connectedChain) return undefined;

  const configs = objectEntries(definitions).flatMap(([chain, definition]) =>
    objectEntries(definition).flatMap(([networkEnvironment, config]) => ({
      chain,
      networkEnvironment,
      config,
    }))
  );

  return configs.find(({ config }) => config && config.id === connectedChain.id)?.networkEnvironment;
};
