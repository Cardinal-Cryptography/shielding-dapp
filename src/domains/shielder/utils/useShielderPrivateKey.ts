import { Address, Hex } from 'viem';

import useConnectedChainNetworkEnvironment from 'src/domains/chains/utils/useConnectedChainNetworkEnvironment';
import useShielderStore from 'src/domains/shielder/stores/shielder';

export default (address: Address | undefined) => {
  const { shielderPrivateKeys, setShielderPrivateKeys } = useShielderStore();

  const networkEnvironment = useConnectedChainNetworkEnvironment();

  if (!address || !networkEnvironment) return { setShielderPrivateKey: undefined };

  return {
    shielderPrivateKey: shielderPrivateKeys[networkEnvironment]?.[address],
    setShielderPrivateKey: (privateKey: Hex) => void setShielderPrivateKeys(networkEnvironment, address, privateKey),
  };
};
