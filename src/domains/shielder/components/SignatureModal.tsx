import { skipToken, useQuery } from '@tanstack/react-query';
import { signMessage } from '@wagmi/core';
import { useState } from 'react';
import styled, { css } from 'styled-components';
import { keccak256, toHex } from 'viem';
import { useAccount } from 'wagmi';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import { wagmiAdapter } from 'src/domains/chains/utils/clients';
import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import Modal from 'src/domains/misc/components/Modal';
import CheckedContainer from 'src/domains/misc/components/PatternContainer';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import { useShielderStore } from 'src/domains/shielder/stores/shielder';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const SignatureModal = () => {
  const [isTryingAgain, setIsTryingAgain] = useState(false);
  const { address, disconnect, isConnected } = useWallet();
  const { connector } = useAccount();
  const { setShielderPrivateKeySeeds, shielderPrivateKey } = useShielderStore(address);
  const getShielderPrivateKey = async () => {
    if (!address) throw new Error('No address');
    const signature = await signMessage(wagmiAdapter.wagmiConfig, {
      message: `I love common wallet on account - ${address}`,
    });
    const key = keccak256(toHex(signature));
    setShielderPrivateKeySeeds(address, key);
    return key;
  };

  const isReady = !!connector?.getChainId && isConnected;

  const { refetch, isError: isSigningError, isLoading } = useQuery({
    enabled: !shielderPrivateKey,
    queryKey: address ? getQueryKey.shielderPrivateKey(address) : [],
    queryFn: isReady ? getShielderPrivateKey : skipToken,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  const retry = async () => {
    setIsTryingAgain(true);
    try {
      await refetch();
    } finally {
      setIsTryingAgain(false);
    }
  };

  const isError = isTryingAgain || isSigningError || !isConnected;

  return (
    <Modal isOpenInitially={isConnected && !shielderPrivateKey } nonDismissable>
      <Content>
        <CheckedContainer>
          <SignatureIcon size={60} icon="Signature" color={isError ? vars('--color-status-danger-foreground-1-rest') : undefined} />
        </CheckedContainer>
        <Title $isError={isError}>{isError ? 'Signature Declined' : 'Signature required'}</Title>
        <Text>To create a Shielded account, a one-time signature is required.</Text>
        <LearnMore>
          <p>Learn more</p>
          <CIcon icon="Open" size={20} />
        </LearnMore>
        <Buttons>
          <Button variant="primary" onClick={() => void retry()} isLoading={isLoading}>
            {isLoading ? 'Waiting for Signature' : 'Try again'}
          </Button>
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
  ${({ $isError }) => $isError && css`color: ${vars('--color-status-danger-foreground-1-rest')};`}
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
