import { useAppKitNetwork } from '@reown/appkit/react';
import { useMemo } from 'react';

import getChainConfigById from 'src/domains/chains/utils/getChainConfigById';

const useChain = () => {
  const { chainId } = useAppKitNetwork();

  return useMemo(() => {
    if (!chainId) return;

    return getChainConfigById(chainId);
  }, [chainId]);
};

export default useChain;
