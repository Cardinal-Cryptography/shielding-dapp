import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { objectEntries } from 'tsafe';

import chainsDefinitions from 'src/domains/chains/utils/definitions';

const mainnetNetworks = objectEntries(chainsDefinitions)
  .map(([_, network]) => network.mainnet)
  .filter((c => !c.disabled));
const testnetNetworks = objectEntries(chainsDefinitions)
  .map(([_, network]) => network.testnet)
  .filter((c => !c.disabled));

const networks = [...mainnetNetworks, ...testnetNetworks];
const projectId = import.meta.env.PUBLIC_VAR_REOWN_PROJECT_ID;

export default new WagmiAdapter({
  networks,
  projectId,
});
