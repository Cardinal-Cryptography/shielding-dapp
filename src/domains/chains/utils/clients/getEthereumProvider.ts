import { EthereumProvider } from '@walletconnect/ethereum-provider';
import memoize from 'memoizee';
import { objectEntries } from 'tsafe';

import chainsDefinitions from '../definitions';

const TESTNET_CHAIN_IDS = objectEntries(chainsDefinitions)
  .map(([_, network]) => network.testnet.id) as [number, ...number[]];

const MAINNET_CHAIN_IDS = objectEntries(chainsDefinitions)
  .map(([_, network]) => network.mainnet.id) as [number, ...number[]];

export default memoize(() => {
  return EthereumProvider.init({
    projectId: import.meta.env.PUBLIC_VAR_REOWN_PROJECT_ID,
    chains: MAINNET_CHAIN_IDS,
    optionalChains: TESTNET_CHAIN_IDS,
    showQrModal: true,
  });
});
