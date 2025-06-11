import { skipToken, useQuery } from '@tanstack/react-query';
import { signMessage } from '@wagmi/core';
import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { keccak256, toHex } from 'viem';
import { useAccount } from 'wagmi';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import { wagmiAdapter } from 'src/domains/chains/utils/clients';
import useConnectedChainNetworkEnvironment from 'src/domains/chains/utils/useConnectedChainNetworkEnvironment';
import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import Modal from 'src/domains/misc/components/Modal';
import CheckedContainer from 'src/domains/misc/components/PatternContainer';
import { KEY_GENERATION_PROCESS_LINK } from 'src/domains/misc/consts/consts';
import { NEVER_CHANGING_DATA_OPTIONS } from 'src/domains/misc/consts/dataOptions';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import {
  MAINNET_SHIELDER_PRIVATE_KEY_SIGNING_MESSAGE,
  TESTNET_SHIELDER_PRIVATE_KEY_SIGNING_MESSAGE,
} from 'src/domains/shielder/consts/consts';
import useShielderPrivateKey from 'src/domains/shielder/utils/useShielderPrivateKey';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const SignatureModal = () => {
  const [isTryingAgain, setIsTryingAgain] = useState(false);
  const { address, disconnect, isConnected } = useWallet();
  const { connector } = useAccount();
  const { shielderPrivateKey, setShielderPrivateKey } = useShielderPrivateKey(address);
  const networkEnvironment = useConnectedChainNetworkEnvironment();

  const getShielderPrivateKey = async () => {
    if (!setShielderPrivateKey) throw new Error('Setting shielder private key not possible.');
    if (!networkEnvironment) throw new Error('Can\'t generate shielder private key - network environment is not known.');

    if (!address) throw new Error('No address');

    const message = {
      mainnet: MAINNET_SHIELDER_PRIVATE_KEY_SIGNING_MESSAGE,
      testnet: TESTNET_SHIELDER_PRIVATE_KEY_SIGNING_MESSAGE,
    }[networkEnvironment];

    const signature = await signMessage(wagmiAdapter.wagmiConfig, { message });
    const key = keccak256(toHex(signature));
    return key;
  };

  const isReady =
    !!connector?.getChainId &&
    isConnected &&
    address &&
    networkEnvironment;

  const { refetch, isError: isSigningError, isLoading, isSuccess, data: shielderPrivateKeyFromRq } = useQuery({
    enabled: !shielderPrivateKey,
    queryKey: isReady ? getQueryKey.shielderPrivateKey(address, networkEnvironment) : [],
    queryFn: isReady ? getShielderPrivateKey : skipToken,
    ...NEVER_CHANGING_DATA_OPTIONS,
    retry: false,
  });
  useEffect(() => {
    if (shielderPrivateKeyFromRq) setShielderPrivateKey?.(shielderPrivateKeyFromRq);
  }, [shielderPrivateKeyFromRq]); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = async () => {
    setIsTryingAgain(true);
    try {
      await refetch();
    } finally {
      setIsTryingAgain(false);
    }
  };

  const isError = isTryingAgain || isSigningError;

  return (
    <Modal
      nonDismissible
      config={{
        content: (
          <Content>
            <CheckedContainer>
              <SignatureIcon size={60} icon="Signature" color={isError ? vars('--color-status-danger-foreground-1-rest') : undefined} />
            </CheckedContainer>
            <Title $isError={isError}>{isError ? 'Signature Declined' : 'Signature required'}</Title>
            <Text>
              To create a Shielded account, a one-time signature is required.
              Approve message in your wallet to automatically continue or disconnect.
            </Text>
            <LearnMore>
              <a href={KEY_GENERATION_PROCESS_LINK} target="_blank" rel="noopener noreferrer">Learn more</a>
              <CIcon icon="Open" size={20} />
            </LearnMore>
            <Buttons>
              {isReady && !isLoading && !isSuccess && (
                <Button variant="primary" onClick={() => void retry()} isLoading={isLoading}>
                  Try again
                </Button>
              )}
              <Button variant="outline" onClick={() => void disconnect()}>Disconnect</Button>
            </Buttons>
          </Content>
        ),
      }}
    />
  );
};

export default SignatureModal;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${vars('--spacing-l')};
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

const LearnMore = styled.div`
  display: flex;
  gap: ${vars('--spacing-xs')};
  ${typography.web.body1};
  
  &, & > a {
    color: ${vars('--color-brand-foreground-link-rest')};
    
    text-decoration: none;
  }
`;
