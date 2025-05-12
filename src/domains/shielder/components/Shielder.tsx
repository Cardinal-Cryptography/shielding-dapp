import styled from 'styled-components';
import { objectEntries } from 'tsafe';

import useChain from 'src/domains/chains/utils/useChain';
import CIcon from 'src/domains/misc/components/CIcon';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import Skeleton from 'src/domains/misc/components/Skeleton';
import Title from 'src/domains/misc/components/Title.tsx';
import shieldImage from 'src/domains/shielder/assets/shield.png';
import AccountTypeSelector from 'src/domains/shielder/components/AccountTypeSelector';
import TokenList from 'src/domains/shielder/components/TokenList';
import useShielderStore from 'src/domains/shielder/stores/shielder';
import useShielderClient from 'src/domains/shielder/utils/useShielderClient';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const Shielder = () => {
  const chainConfig = useChain();
  const { isSuccess } = useShielderClient();
  const { selectedAccountType } = useShielderStore();

  const nonNativeTokens = chainConfig ?
    objectEntries(chainConfig.whitelistedTokens).map(([address, token]) => ({
      ...token,
      address,
      isNative: false as const,
      chain: chainConfig.chain,
    })) :
    [];

  const nativeToken = chainConfig ? {
    address: undefined,
    isNative: true as const,
    chain: chainConfig.chain,
    icon: chainConfig.NativeTokenIcon,
  } : undefined;

  const tokens = [...(nativeToken ? [nativeToken] : []), ...nonNativeTokens];

  const content = isSuccess ? (
    <>
      <Title size="medium">Your accounts</Title>
      <AccountTypeSelector />
      {selectedAccountType === 'public' && (
        <InfoBox>
          <CIcon icon="Info" size={20} />
          <p>Tokens that can be moved to shielded account:</p>
        </InfoBox>
      )}
      <TokensWrapper>
        <TokenList tokens={tokens} />
      </TokensWrapper>
      {selectedAccountType === 'shielded' && (
        <Disclaimer>
          <InfoContainer>
            <CIcon icon="InfoRegular" size={20} color={vars('--color-neutral-foreground-3-rest')} />
            <p>
              Shielded account is created based on your connected account.
              It's specific to the platform you use – accounts created in
              the Web App can be retrieved from the Web App on another device.
            </p>
          </InfoContainer>
          <ShieldImage src={shieldImage} alt="Shield icon" />
        </Disclaimer>
      )}
    </>
  ) : <Skeleton style={{ height: '100%', minHeight: '400px', width: '100%', borderRadius: vars('--border-radius-m') }} />;

  return (
    <Wrapper>
      <Container>
        {content}
      </Container>
    </Wrapper>
  );
};

export default Shielder;

const Container = styled(DoubleBorderBox.Content)`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-l')};
  padding: ${vars('--spacing-l')};
`;

const TokensWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-s')};
  padding-left: ${vars('--spacing-s')};
  color: ${vars('--color-neutral-foreground-3-rest')};
  ${typography.web.body1Strong};
`;

const Wrapper = styled(DoubleBorderBox.Wrapper)`
  width: 100%;
  overflow: hidden;
`;

const Disclaimer = styled(DoubleBorderBox.Content)`
  display: flex;

  flex-direction: row;
  justify-content: space-between;
  gap: ${vars('--spacing-m')};

  margin: ${vars('--spacing-none')};
  padding: ${vars('--spacing-m')};
  padding: ${vars('--spacing-xs')} 0 0 0;

  background: ${vars('--color-neutral-background-4a-rest')};
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-xs')};
  padding: ${vars('--spacing-m')} ${vars('--spacing-l')} ${vars('--spacing-l')};
  color: ${vars('--color-neutral-foreground-2-rest')};
  ${typography.web.caption1};
`;

const ShieldImage = styled.img`
  align-self: end;
  height: 120px;
  margin-bottom: -2px;
  margin-right: -32px;
  pointer-events: none;
`;
