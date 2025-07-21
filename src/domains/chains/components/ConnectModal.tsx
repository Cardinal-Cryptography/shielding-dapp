import styled from 'styled-components';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import BIcon from 'src/domains/misc/components/BIcon';
import Button from 'src/domains/misc/components/Button';
import Modal, { useModalControls } from 'src/domains/misc/components/Modal';
import CheckedContainer from 'src/domains/misc/components/PatternContainer';
import { PRIVACY_POLICY_LINK, TERMS_OF_CONDITIONS_LINK, TERMS_OF_SERVICE_LINK } from 'src/domains/misc/consts/consts';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const ConnectModal = () => {
  const { close } = useModalControls();
  const { openModal } = useWallet();

  const handleAgreeClick = () => {
    void openModal({ view: 'Connect' });
    close();
  };

  return (
    <Modal
      config={
        {
          title: 'Welcome',
          content: (
            <Content>
              <CheckedContainer>
                <Branding>
                  <LogoContainer>
                    <BIcon icon="Blanksquare" size={26} />
                  </LogoContainer>
                  <p>Blanksquare Web App</p>
                </Branding>
              </CheckedContainer>
              <Title>
                We value your privacy!
              </Title>
              <Text>
                By clicking the button "Agree and continue" below,
                you confirm that you have read and that you accept our:
              </Text>
              <LinksWrapper>
                <Link href={TERMS_OF_SERVICE_LINK} target="_blank" rel="noopener noreferrer">
                  <BIcon icon="DocumentText" size={20} />
                  <p>Terms of service</p>
                </Link>
                <Link href={TERMS_OF_CONDITIONS_LINK} target="_blank" rel="noopener noreferrer">
                  <BIcon icon="DocumentText" size={20} />
                  <p>Terms and Conditions</p>
                </Link>
                <Link href={PRIVACY_POLICY_LINK} target="_blank" rel="noopener noreferrer">
                  <BIcon icon="DocumentText" size={20} />
                  <p>Privacy policy</p>
                </Link>
              </LinksWrapper>
              <Buttons>
                <Button variant="primary"
                  onClick={() => {
                    void handleAgreeClick();
                  }}
                >
                  Agree and continue
                </Button>
              </Buttons>
            </Content>
          ),
        }
      }
    />
  );
};

export default ConnectModal;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${vars('--spacing-l')};
`;

const Title = styled.h3`
  ${typography.subtitle1};
`;

const Text = styled.p`
  max-width: 356px;
  padding-inline: ${vars('--spacing-l')};
  color: ${vars('--color-neutral-foreground-2-rest')};
  text-align: center;

  text-wrap: pretty;

  ${typography.body1};
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${vars('--spacing-l')};
`;

const Link = styled.a`
  display: flex;
  gap: ${vars('--spacing-xs')};
  color: ${vars('--color-brand-foreground-link-rest')};
  ${typography.body1};
  
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
  ${typography.subtitle1};
`;

const LogoContainer = styled.div`
  display: grid;
  place-items: center;
  padding: ${vars('--spacing-xxs')};
`;
