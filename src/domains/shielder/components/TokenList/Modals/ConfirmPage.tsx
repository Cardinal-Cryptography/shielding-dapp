import { skipToken, useQuery } from '@tanstack/react-query';
import { ComponentProps } from 'react';
import styled from 'styled-components';
import { type Address } from 'viem';
import { usePublicClient } from 'wagmi';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import AccountTypeIcon from 'src/domains/misc/components/AccountTypeIcon';
import Button from 'src/domains/misc/components/Button';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import TokenIcon from 'src/domains/misc/components/TokenIcon';
import formatAddress from 'src/domains/misc/utils/formatAddress';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import FeeBreakdown from 'src/domains/shielder/components/FeeRows';
import { Token } from 'src/domains/shielder/components/TokenList';
import useShielderFees from 'src/domains/shielder/utils/useShielderFees';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  token: Token & {
    symbol?: string,
    decimals?: number,
    balance?: bigint,
  },
  addressTo?: Address,
  addressFrom?: Address,
  feeConfig: ComponentProps<typeof FeeBreakdown>['config'],
  amount: bigint,
  onConfirm: () => void,
  loadingText?: string,
};

const ConfirmPage = ({ token, feeConfig, amount, addressTo, onConfirm, loadingText, addressFrom }: Props) => {
  const { address } = useWallet();
  const publicClient = usePublicClient();
  const chainConfig = useChain();

  const fees = useShielderFees({ walletAddress: address, token });

  const { data: publicNativeBalance } = useQuery({
    queryKey:
      address && chainConfig?.id ?
        getQueryKey.tokenPublicBalance(address, chainConfig.id, address) :
        [],
    queryFn:
      publicClient && address ?
        () => publicClient.getBalance({ address }) :
        skipToken,
  });

  const hasInsufficientFees = publicNativeBalance && fees?.fee_details.total_cost_native ?
    publicNativeBalance < fees.fee_details.total_cost_native :
    false;

  const isButtonDisabled = amount <= 0n || hasInsufficientFees || !!loadingText;

  const buttonLabel =
    hasInsufficientFees ?
      `Insufficient ${chainConfig?.nativeCurrency.symbol} Balance` :
      loadingText ?? 'Confirm';

  return (
    <Container>
      <Wrapper>
        {token.decimals && (
          <Content>
            <TokenDetails>
              <TokenIcon Icon={token.icon} size={40} />
              <p>{token.symbol}</p>
            </TokenDetails>
            <Amount>
              {formatBalance({ balance: amount, decimals: token.decimals, options: { formatDecimals: 4 }})}
            </Amount>
          </Content>
        )}
        <Content>
          <p>From</p>
          <AccountDetails>
            <AccountTypeIcon size={20} type={addressFrom ? 'public' : 'shielded'} />
            {addressFrom && (
              <>
                <p>Public</p>
                <Divider />
              </>
            )}
            {addressFrom ? <Address>{formatAddress(addressFrom)}</Address> : 'Shielded'}
          </AccountDetails>
        </Content>
        {addressTo && (
          <Content>
            <p>To</p>
            <Address>{formatAddress(addressTo)}</Address>
          </Content>
        )}
      </Wrapper>
      <Footer>
        <FeeBreakdown config={feeConfig} />
        <Button isLoading={!!loadingText} disabled={isButtonDisabled} variant="primary" onClick={onConfirm}>
          {buttonLabel}
        </Button>
      </Footer>
    </Container>
  );
};

export default ConfirmPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${vars('--spacing-xxxxl')};
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-s')};
`;

const Footer = styled(Wrapper)`
  gap: ${vars('--spacing-xl')};
`;

const Content = styled(DoubleBorderBox.Content)`
  display: flex;
  
  gap: ${vars('--spacing-m')};
  align-items: center;
  justify-content: space-between;

  margin: ${vars('--spacing-none')};
  padding: ${vars('--spacing-l')};

  background: ${vars('--color-neutral-background-4a-rest')};
  
  ${typography.web.body1};
`;

const AccountDetails = styled.div`
  display: flex;
  gap: ${vars('--spacing-s')};
  align-items: center;
`;

const Address = styled.p`
  color: ${vars('--color-brand-foreground-1-rest')};
`;

const Amount = styled.div`
  ${typography.decorative.title1};
`;

const TokenDetails = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-s')};
  ${typography.decorative.subtitle2};
`;

const Divider = styled.div`
  height: 12px;
  width: 1px;
  background: ${vars('--color-neutral-stroke-2-rest')};
`;
