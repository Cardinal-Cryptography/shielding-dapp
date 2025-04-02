import { useQuery } from '@tanstack/react-query';
import { signMessage } from '@wagmi/core';
import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { keccak256, toHex } from 'viem';

import { useWallet } from 'src/domains/chains/components/WalletProvider.tsx';
import { wagmiAdapter } from 'src/domains/chains/utils/clients';
import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import Modal from 'src/domains/misc/components/Modal';
import PatternContainer from 'src/domains/misc/components/PatternContainer';
import getQueryKey from 'src/domains/misc/utils/getQueryKey.ts';
import { useShielderStore } from 'src/domains/shielder/stores/shielder.ts';
import { typography } from 'src/domains/styling/utils/tokens.ts';
import vars from 'src/domains/styling/utils/vars.ts';

const SignatureModal = () => {
  const [isTryingAgain, setIsTryingAgain] = useState(false);
  const { address, disconnect, isConnected } = useWallet();
  const { shielderPrivateKey, setShielderPrivateKeySeeds } = useShielderStore(address);

  const getShielderPrivateKey = async () => {
    if(!address) {
      throw new Error('Account address is not available');
    }
    // TODO(SD-30): Replace placeholder with proper message for common wallet usage.
    // https://cardinal-cryptography.atlassian.net/browse/SD-30
    const message = `I love common wallet on account - ${address}`;
    const signature = await signMessage(wagmiAdapter.wagmiConfig, {
      message,
    });

    const key = keccak256(toHex(signature));
    setShielderPrivateKeySeeds(address, key);
    return key;
  };

  const { refetch, isError: isSigningError, isLoading } = useQuery({
    enabled: false,
    queryKey: address ? getQueryKey.shielderPrivateKey(address) : [],
    queryFn: getShielderPrivateKey,
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    const requestSignature = () => {
      if(isConnected && !shielderPrivateKey) {
        void refetch();
      }
    };

    const timeoutId = setTimeout(requestSignature, 500);

    return () => void clearTimeout(timeoutId);
  }, [isConnected, shielderPrivateKey, refetch]);

  const handleTryAgain = () => {
    setIsTryingAgain(true);
    void refetch();
  };

  const isError = isTryingAgain || isSigningError || !isConnected;

  return (
    <Modal isOpenInitially={isConnected && !shielderPrivateKey} nonDismissable>
      <Content>
        <PatternContainer>
          <SignatureIcon size={60} icon="Signature" color={isError ? vars('--color-status-danger-foreground-1-rest') : undefined} />
        </PatternContainer>
        <Title $isError={isError}>
          {isError ? 'Signature Declined' : 'Signature required'}
        </Title>
        <Text>
          To create a Shielded account, a one-time signature is required.
          Approve message in your wallet to automatically continue.
        </Text>
        <LearnMore>
          <p>Learn more</p>
          <CIcon icon="Open" size={20} />
        </LearnMore>
        <Buttons>
          <Button variant="primary" onClick={() => void handleTryAgain()} isLoading={isLoading}>{isLoading ? 'Waiting for Signature' : 'Try again'}</Button>
          {isError && <Button variant="outline" onClick={() => void disconnect()}>Disconnect</Button>}
        </Buttons>
      </Content>
    </Modal>
  );
};

export default SignatureModal;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${vars('--spacing-l')};
  width: 384px;
`;

const SignatureIcon = styled(CIcon)`
  position: relative;
`;

const Title = styled.h3<{ $isError?: boolean }>`
  ${typography.decorative.subtitle1};
  ${({ $isError }) => $isError && css`
    color: ${vars('--color-status-danger-foreground-1-rest')};
  `}
`;

const Text = styled.p`
  ${typography.decorative.body1};
  text-align: center;
  color: ${vars('--color-neutral-foreground-2-rest')};
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-s')};
  width: 100%;
`;

const LearnMore = styled.a`
  display: flex;
  gap: ${vars('--spacing-xs')};
  color: ${vars('--color-brand-foreground-link-rest')};
  ${typography.web.body1};
`;
