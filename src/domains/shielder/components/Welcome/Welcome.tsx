import styled from 'styled-components';

import Button from 'src/domains/misc/components/Button';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox.tsx';
import { typography } from 'src/domains/styling/utils/tokens.ts';
import vars from 'src/domains/styling/utils/vars.ts';

import breakTheTrace from './breakTheTrace.png';

const STEPS = ['Connect your EVM wallet', 'Shield your tokens', 'You\'re protected from tracking. Stay for a while!', 'Send them to a fresh address once you need them again'];

const Welcome = () => (
  <DoubleBorderBox.Wrapper>
    <Content>
      <BreakTheTrace src={breakTheTrace} />
      <Steps>
        <Title>Make your onchain actions private and secure with shielding.</Title>
        <List>
          {STEPS.map((step, index) => (
            <Step>
              <StepNumber>{index+1}</StepNumber>
              <p>{step}</p>
            </Step>
          ))}
        </List>
      </Steps>
      <ConnectButton size="large" variant="primary">Connect Wallet</ConnectButton>
    </Content>
  </DoubleBorderBox.Wrapper>
);

export default Welcome;

const BreakTheTrace = styled.img`
  height: 133px;
  margin-top: calc(${vars('--spacing-s')} * -1);
  pointer-events: none;

  user-select: none;
`;

const Content = styled(DoubleBorderBox.Content)`
  display: flex;

  flex-direction: column;
  align-items: center;
  gap: ${vars('--spacing-l')};

  max-width: 418px;
  padding: ${vars('--spacing-l')};
`;

const ConnectButton = styled(Button)`
  margin-top: ${vars('--spacing-l')};
  width: 100%;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-l')};
  width: 286px;
`;

const Steps = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-l')};
`;

const Title = styled.h2`
  max-width: 308px;
  text-align: center;
  ${typography.web.body1Strong};
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-s')};
  color: ${vars('--color-neutral-foreground-2-rest')};
  ${typography.web.body1};
`;

const StepNumber = styled.div`
  display: grid;

  place-items: center;

  height: 24px;
  width: 24px;

  background: ${vars('--color-neutral-background-5a-rest')};
  border-radius: ${vars('--border-radius-circular')};
  
  flex-shrink: 0;

  ${typography.decorative.body1};
`;
