import { useLocalStorageValue } from '@react-hookz/web';
import { useAppKitNetwork } from '@reown/appkit/react';
import { useState } from 'react';
import styled from 'styled-components';
import { type Address } from 'viem';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import getChainConfigById from 'src/domains/chains/utils/getChainConfigById';
import Button from 'src/domains/misc/components/Button';
import CopyButton from 'src/domains/misc/components/CopyButton';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import formatAddress from 'src/domains/misc/utils/formatAddress';
import Balance from 'src/domains/shielder/components/Balance';
import TokenList, { Token } from 'src/domains/shielder/components/TokenList';
import useShield from 'src/domains/shielder/utils/useShield';
import useWithdraw from 'src/domains/shielder/utils/useWithdraw';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';
import useTokens from 'src/domains/tokens/utils/useTokens';

const Shielder = () => {
  const {
    value: selectedAccountType = 'public',
    set: setSelectedAccountType,
  } = useLocalStorageValue<'public' | 'shielded'>('selectedAccountType', { defaultValue: 'public', initializeWithValue: true });
  const [selectedToken, setSelectedToken] = useState<Address | 'native' | null>(null);
  const { openModal, isConnected, address: accountAddress } = useWallet();
  const { chainId } = useAppKitNetwork();

  const { shield, isShielding } = useShield();
  const { withdraw, isWithdrawing } = useWithdraw();

  const handleSelect = (token: Token) => {
    const address = token.isNative ? 'native' : token.address;

    setSelectedToken(curr => curr === address ? null : address);
  };
  const chainConfig = chainId ? getChainConfigById(chainId) : undefined;

  const { tokens } = useTokens();

  const tokenList = tokens.map(({ balance, ...token }) =>
    ({ ...token, balance: { ...balance, atomic: balance.atomic[selectedAccountType] }})
  );

  const selectedTokenData = tokenList.find(token =>selectedToken === 'native' ? token.isNative : token.address === selectedToken);

  const handleShieldOrUnShield = () => {
    const balance = typeof selectedTokenData?.balance.atomic == 'bigint' ? selectedTokenData.balance.atomic : null;

    if(!balance || !selectedTokenData) return;

    if (selectedAccountType === 'public') {
      void shield({ token: selectedTokenData, amount: balance });
    } else if(accountAddress) {
      void withdraw({
        token: selectedTokenData,
        amount: balance, addressTo:
        accountAddress,
        useManualWithdraw: true,
      });
    }
  };
  return (
    <DoubleBorderBox.Wrapper>
      <Container>
        {!isConnected && (
          <ConnectContainer>
            <Button
              onClick={() => void openModal({ view: 'Connect' })}
              variant="primary"
            >
              Connect wallet
            </Button>
          </ConnectContainer>
        )}
        <BalanceWrapper>
          <Header>
            <Title>Your Assets</Title>
            {accountAddress && (
              <Actions>
                <AddressWrapper>
                  <Address size={18} data={accountAddress}>{formatAddress(accountAddress)}</Address>
                </AddressWrapper>
              </Actions>
            )}
          </Header>
          <Balance
            selectedAccountType={selectedAccountType}
            setSelectedAccountType={setSelectedAccountType}
            publicBalance={undefined}
            privateBalance={undefined}
            nativeAssetDecimals={chainConfig?.nativeCurrency.decimals}
            nativeAssetUsdPrice={undefined}
            publicTokensUsdValue={undefined}
          />
        </BalanceWrapper>
        <TokensWrapper>
          <TokenList
            selectedTokens={selectedTokenData ? [selectedTokenData] : []}
            onTokenClick={handleSelect}
            tokens={tokenList}
          />
        </TokensWrapper>
        <ButtonWrapper>
          <StyledButton
            disabled={!selectedTokenData?.balance.atomic || isShielding || isWithdrawing}
            onClick={
              handleShieldOrUnShield
            }
            variant="primary"
          >
            {selectedAccountType === 'public' ? 'Shield tokens' : 'Unshield tokens'}
          </StyledButton>
        </ButtonWrapper>
      </Container>
    </DoubleBorderBox.Wrapper>
  );
};

export default Shielder;

const Container = styled(DoubleBorderBox.Content)`
  padding: ${vars('--spacing-none')}
`;

const BalanceWrapper = styled.div`
  padding-inline: ${vars('--spacing-m')};
  box-shadow: 0 10px 10px ${vars('--color-neutral-background-alpha-1-rest')};
`;

const TokensWrapper = styled.div`
  padding-inline: ${vars('--spacing-m')};
  padding-block: ${vars('--spacing-l')};
  height: 300px;
  overflow: hidden;
`;

const ButtonWrapper = styled.div`
  padding: ${vars('--spacing-m')};
`;

const StyledButton = styled(Button)`
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
`;

const Title = styled.h2`
  ${typography.decorative.subtitle2};
`;

const AddressWrapper = styled.div`
  display: flex;
  gap: ${vars('--spacing-s')};
`;

const Address = styled(CopyButton)`
  ${typography.web.body1};
  gap: ${vars('--spacing-xs')};
  color: ${vars('--color-brand-foreground-2-rest')};
`;

const ConnectContainer = styled.div`
  display: grid;

  position: absolute;

  place-items: center;

  height: 100%;
  width: 100%;

  z-index: 2;
  backdrop-filter: blur(10px);
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
`;
