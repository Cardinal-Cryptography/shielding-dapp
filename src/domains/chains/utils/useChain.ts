import { useAppKit, useAppKitState } from '@reown/appkit/react';
import { useEffect, useMemo, useRef } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';

import getChainConfigById from 'src/domains/chains/utils/getChainConfigById';

const useChain = (chainIdOverride?: number | string) => {
  const { chainId: currentChainId, isConnected } = useAccount();
  const { chains } = useSwitchChain();
  const { open, close } = useAppKit();
  const { open: isOpen } = useAppKitState();
  const chainId = chainIdOverride ?? currentChainId;

  const isReady = !!chainId && isConnected && chains.length > 0;
  const isChainSupported = isReady ? chains.some(c => c.id === chainId) : undefined;

  const wasPreviouslyUnsupported = useRef(false);

  const chainConfig = useMemo(() => {
    if (!isReady || !isChainSupported) return;
    return getChainConfigById(chainId);
  }, [chainId, isChainSupported, isReady]);

  useEffect(() => {
    if (!isReady) return;

    if (!isChainSupported) {
      wasPreviouslyUnsupported.current = true;
      void open({ view: 'Networks' });
    }

    if (wasPreviouslyUnsupported.current && isChainSupported && isOpen) {
      wasPreviouslyUnsupported.current = false;
      void close();
    }
  }, [isChainSupported, isReady, open, close, isOpen]);

  return chainConfig;
};

export default useChain;
