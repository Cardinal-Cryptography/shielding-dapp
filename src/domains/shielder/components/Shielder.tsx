import styled from 'styled-components';
import { objectEntries } from 'tsafe';

import useChain from 'src/domains/chains/utils/useChain';
import CIcon from 'src/domains/misc/components/CIcon';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import Skeleton from 'src/domains/misc/components/Skeleton';
import Title from 'src/domains/misc/components/Title.tsx';
import AccountTypeSelector from 'src/domains/shielder/components/AccountTypeSelector';
import TokenList from 'src/domains/shielder/components/TokenList';
import { useShielderStore } from 'src/domains/shielder/stores/shielder';
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
        <Disclaimer>
          <CIcon icon="Info" size={20} />
          <p>Tokens that can be moved to shielded account:</p>
        </Disclaimer>
      )}
      <TokensWrapper>
        <TokenList tokens={tokens} />
      </TokensWrapper>
    </>
  ) : <Skeleton style={{ height: '100%', width: '100%', borderRadius: vars('--border-radius-m') }} />;

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
  height: 560px;
`;

const TokensWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`;

const Disclaimer = styled.div`
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
