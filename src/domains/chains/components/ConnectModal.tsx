import { ComponentProps, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import Modal from 'src/domains/misc/components/Modal';
import { ModalRef } from 'src/domains/misc/components/Modal';
import CheckedContainer from 'src/domains/misc/components/PatternContainer';
import { PRIVACY_POLICY_LINK, TERMS_OF_SERVICE_LINK } from 'src/domains/misc/consts/consts.ts';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Props = Pick<ComponentProps<typeof Modal>, 'triggerElement'>;

const ConnectModal = (props: Props) => {
  const { openModal, isConnected } = useWallet();
  const ref = useRef<ModalRef | null>(null);

  useEffect(() => {
    if(!ref.current || !isConnected) return;

    ref.current.close();
  }, [isConnected]);

  return (
    <StyledModal ref={ref} {...props} title="Welcome">
      <Content>
        <CheckedContainer>
          <Branding>
            <LogoContainer><CIcon icon="Common" size={26} color="#406EB2" /></LogoContainer>
            <p>Common Web App</p>
          </Branding>
        </CheckedContainer>
        <Title>
          We value your privacy!
        </Title>
        <Text>
          By proceeding, you acknowledge that you have read and accepted our:
        </Text>
        <LinksWrapper>
          <Link>
            <CIcon icon="DocumentText" size={20} />
            <a href={TERMS_OF_SERVICE_LINK} target="_blank" rel="noopener noreferrer">Terms of service</a>
          </Link>
          <Link>
            <CIcon icon="DocumentText" size={20} />
            <a href={PRIVACY_POLICY_LINK} target="_blank" rel="noopener noreferrer">Privacy policy</a>
          </Link>
        </LinksWrapper>
        <Buttons>
          <Button variant="primary" onClick={() => void openModal({ view: 'Connect' })}>
            Agree and continue
          </Button>
        </Buttons>
      </Content>
    </StyledModal>
  );
};

export default ConnectModal;

const StyledModal = styled(Modal)`
  width: min(434px, 100vw);
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${vars('--spacing-l')};
`;

const Title = styled.h3`
  ${typography.decorative.subtitle1};
`;

const Text = styled.p`
  padding-inline: ${vars('--spacing-l')};
  color: ${vars('--color-neutral-foreground-2-rest')};
  text-align: center;
  ${typography.decorative.body1};
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-s')};
  width: 100%;
  margin-top: ${vars('--spacing-s')};
`;

const LinksWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-l')};
`;

const Link = styled.a`
  display: flex;
  gap: ${vars('--spacing-xs')};
  color: ${vars('--color-brand-foreground-link-rest')};
  ${typography.web.body1};
  
  & > a {
    color: ${vars('--color-brand-foreground-link-rest')};

    text-decoration: none;
  }
`;
const Branding = styled.div`
  display: flex;
  position: relative;
  gap: ${vars('--spacing-s')};
  align-items: center;
  color: ${vars('--color-neutral-foreground-2-rest')};
  ${typography.web.subtitle1};
`;

const LogoContainer = styled.div`
  display: grid;
  place-items: center;
  padding: ${vars('--spacing-xxs')};
  border-radius: ${vars('--spacing-s-nudge')};
  background: #E5EFFF;
`;
