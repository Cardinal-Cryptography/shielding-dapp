import { objectEntries } from 'tsafe';

import isPresent from 'src/domains/misc/utils/isPresent';

import chainsDefinitions from './definitions';

const mainnetChains = objectEntries(chainsDefinitions).map(([, net]) => net.mainnet).filter(isPresent);
const testnetChains = objectEntries(chainsDefinitions).map(([, net]) => net.testnet).filter(isPresent);

export default {
  mainnet: mainnetChains,
  testnet: testnetChains,
  all: [...mainnetChains, ...testnetChains],
};
