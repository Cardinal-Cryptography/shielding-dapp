import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { objectEntries } from 'tsafe';
import { useSwitchChain } from 'wagmi';

import chainsDefinitions from 'src/domains/chains/utils/definitions';
import useChain from 'src/domains/chains/utils/useChain';
import router from 'src/domains/routing/utils/router';

const mainnetChains = objectEntries(chainsDefinitions).map(([_, network]) => network.mainnet);
const testnetChains = objectEntries(chainsDefinitions).map(([_, network]) => network.testnet);
const allChainsDefinitions = [...mainnetChains, ...testnetChains];

const useSyncChainWithUrl = () => {
  const initialChainPath = useRef<string | null>(null);
  const chainConfig = useChain();
  const { switchChainAsync } = useSwitchChain();
  const shieldedAccountRoute = router.useRoute(['Shielded-Account']);

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
    const chainName = shieldedAccountRoute?.params.chainName;
    if (chainName && !initialChainPath.current) {
      const foundChain = allChainsDefinitions.find(c => c.urlPathSegment === chainName);
      if (foundChain) {
        initialChainPath.current = chainName;
        switchChain(foundChain.id);
      }
    }
  }, [shieldedAccountRoute?.params.chainName, switchChain]);

  useEffect(() => {
    if (initialChainPath.current && initialChainPath.current !== chainConfig?.urlPathSegment) return;

    const foundChain = allChainsDefinitions.find(({ id }) => id === chainConfig?.id);
    if (foundChain) {
      router.push('Shielded-Account', { chainName: foundChain.urlPathSegment });
    }
  }, [chainConfig]);
};

export default useSyncChainWithUrl;
