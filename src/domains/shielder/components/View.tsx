import { useMemo } from 'react';
import styled from 'styled-components';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import HelpDisclaimer from 'src/domains/shielder/components/HelpDisclaimer';
import Shielder from 'src/domains/shielder/components/Shielder';
import SignatureModal from 'src/domains/shielder/components/SignatureModal';
import Welcome from 'src/domains/shielder/components/Welcome';
import vars from 'src/domains/styling/utils/vars';

const View = () => {
  const { isConnected, privateKey } = useWallet();

  const content = useMemo(() => {
    if(isConnected && !!privateKey) return <Shielder />;

    return <Welcome />;
  }, [isConnected, privateKey]);

  return (
    <>
      <Container>
        {content}
        <HelpDisclaimer />
      </Container>
      <SignatureModal />
    </>
  );
};

export default View;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-m')};
  max-width: 434px;
  margin: auto;
`;
