import { useEffect } from 'react';
import styled from 'styled-components';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import { useModal } from 'src/domains/misc/components/ModalNew';
import HelpDisclaimer from 'src/domains/shielder/components/HelpDisclaimer';
import Shielder from 'src/domains/shielder/components/Shielder';
import SignatureModal from 'src/domains/shielder/components/SignatureModal';
import Welcome from 'src/domains/shielder/components/Welcome';
import vars from 'src/domains/styling/utils/vars';

const ShielderView = () => {
  const { isConnected, privateKey } = useWallet();
  const isReady = isConnected && !!privateKey;
  const isNetworkSupported = !!useChain();
  const { open, close } = useModal();
  useEffect(() => {
    if(isConnected && !privateKey && isNetworkSupported) {
      open(<SignatureModal />);
    } else {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, privateKey, isNetworkSupported]);

  return (
    <>
      <Container>
        {isReady ? <Shielder /> : <Welcome />}
        <HelpDisclaimer />
      </Container>
    </>
  );
};

export default ShielderView;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-m')};
  max-width: 434px;
`;
