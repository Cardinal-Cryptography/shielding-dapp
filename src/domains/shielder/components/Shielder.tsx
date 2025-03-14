import { useState } from 'react';
import styled from 'styled-components';

import Button from 'src/domains/misc/components/Button';
import CopyButton from 'src/domains/misc/components/CopyButton';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import { Token } from 'src/domains/misc/types/types';
import formatAddress from 'src/domains/misc/utils/formatAddress';
import Balance from 'src/domains/shielder/components/Balance';
import TokenList from 'src/domains/shielder/components/TokenList';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const Shielder = () => {
  //todo Replace with store
  const [selectedAccountType, setSelectedAccountType] = useState<'public' | 'shielded'>('public');
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);

  const handleSelect = (token: Token) => {
    setSelectedTokens(curr => {
      if(curr.some(t => t.address === token.address)) {
        return curr.filter(t => t.address !== token.address);
      } else {
        return [...curr, token];
      }});
  };

  return (
    <Container>
      <BalanceWrapper>
        <Header>
          <Title>Your Assets</Title>
          <AddressWrapper><Address size={18} data="Text">{formatAddress('0x4b8e2d4f9a1c3e7d5b6f8a2e9c7d4f3b1a0c9e8d')}</Address></AddressWrapper>
        </Header>
        <Balance
          selectedAccountType={selectedAccountType}
          setSelectedAccountType={setSelectedAccountType}
          publicBalance={5678n * 10n ** 18n}
          privateBalance={123n * 10n ** 18n}
          nativeAssetDecimals={18}
          nativeAssetUsdPrice={0.51}
          publicTokensUsdValue={123.45}
        />
      </BalanceWrapper>
      <TokensWrapper>
        <TokenList
          selectedTokens={selectedTokens}
          onTokenClick={handleSelect}
          tokens={[
            {
              address: '0x1',
              name: 'Ethereum',
              chain: 'alephEvm',
              icon: 'Eth',
              decimals: 18,
              balance: {
                atomic: '1500000000000000000',
                usd: 4500,
              },
              usdPrice: 3000,
              symbol: 'ETH',
            },
            {
              address: '0x2',
              name: 'Aleph Zero',
              icon: 'Azero',
              chain: 'alephEvm',
              decimals: 8,
              balance: {
                atomic: '50000000000',
                usd: 75,
              },
              usdPrice: 0.15,
              symbol: 'AZERO',
            },
            {
              address: '0x3',
              name: 'Bitcoin',
              icon: 'WBtc',
              chain: 'alephEvm',
              decimals: 8,
              balance: {
                atomic: '25000000',
                usd: 12500,
              },
              usdPrice: 50000,
              symbol: 'BTC',
            },
            {
              address: '0x4',
              name: 'Tether',
              icon: 'Usdt',
              chain: 'alephEvm',
              decimals: 6,
              balance: {
                atomic: '1000000000',
                usd: 1000,
              },
              usdPrice: 1,
              symbol: 'USDT',
            },
            {
              address: '0x5',
              name: 'USD Coin',
              icon: 'Usdc',
              chain: 'alephEvm',
              decimals: 6,
              balance: {
                atomic: '500000000',
                usd: 500,
              },
              usdPrice: 1,
              symbol: 'USDC',
            },
          ]}
        />
      </TokensWrapper>
      <ButtonWrapper>
        <StyledButton variant="primary">Shield tokens</StyledButton>
      </ButtonWrapper>
    </Container>
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
