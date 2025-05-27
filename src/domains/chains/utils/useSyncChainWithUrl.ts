import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useSwitchChain } from 'wagmi';

import supportedChains from 'src/domains/chains/utils/supportedChains';
import useChain from 'src/domains/chains/utils/useChain';
import router from 'src/domains/routing/utils/router';

const { all: allChainsDefinitions } = supportedChains;

const useSyncChainWithUrl = () => {
  const initialChainPath = useRef<string | null>(null);
  const chainConfig = useChain();
  const { switchChainAsync } = useSwitchChain();
  const shieldedAccountWithChainRoute = router.useRoute(['Shielded-Account-With-Chain']);

  const { mutate: switchChain } = useMutation({
    mutationFn: async (chainId: number) => {
      return switchChainAsync({ chainId });
    },
    retry: 3,
    onSettled: () => {
      initialChainPath.current = null;
    },
    onError: err => {
      console.error('switchChain failed', err);
    },
  });

  useEffect(() => {
    const chainName = shieldedAccountWithChainRoute?.params.chainName;
    if (chainName && !initialChainPath.current) {
      const foundChain = allChainsDefinitions.find(c => c.urlPathSegment === chainName);
      if (foundChain) {
        initialChainPath.current = chainName;
        switchChain(foundChain.id);
      }
    }
  }, [shieldedAccountWithChainRoute?.params.chainName, switchChain]);

  useEffect(() => {
    if (initialChainPath.current && initialChainPath.current !== chainConfig?.urlPathSegment) return;

    const foundChain = allChainsDefinitions.find(({ id }) => id === chainConfig?.id);
    if (foundChain) {
      router.push('Shielded-Account-With-Chain', { chainName: foundChain.urlPathSegment });
    }
  }, [chainConfig]);
};

export default useSyncChainWithUrl;
