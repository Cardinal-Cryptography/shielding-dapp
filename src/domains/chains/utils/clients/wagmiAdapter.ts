import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

import supportedChains from 'src/domains/chains/utils/supportedChains';

const { all: networks } = supportedChains;
const projectId = import.meta.env.PUBLIC_VAR_REOWN_PROJECT_ID;

export default new WagmiAdapter({
  networks,
  projectId,
});
