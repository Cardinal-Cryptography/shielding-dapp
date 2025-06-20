import { useIsMutating } from '@tanstack/react-query';
import styled from 'styled-components';

import Button from 'src/domains/misc/components/Button';
import { useModal } from 'src/domains/misc/components/Modal';
import Skeleton from 'src/domains/misc/components/Skeleton';
import TokenIcon from 'src/domains/misc/components/TokenIcon';
import { MUTATION_KEYS } from 'src/domains/misc/utils/getQueryKey.ts';
import isPresent from 'src/domains/misc/utils/isPresent';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import useShielderStore from 'src/domains/shielder/stores/shielder';
import useTokenData from 'src/domains/shielder/utils/useTokenData';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import SendModal from './Modals/SendModal';
import ShieldModal from './Modals/ShieldModal';

import { Token } from '.';

type Props = {
  token: Token,
};

const TokenListItem = ({ token }: Props) => {
  const { selectedAccountType } = useShielderStore();
  const isPublic = selectedAccountType === 'public';

  const {
    symbolQuery: { data: symbol },
    decimalsQuery: { data: decimals },
    shieldedBalanceQuery: { data: shieldedBalance },
    publicBalanceQuery: { data: publicBalance },
    nameQuery: { data: name },
  } = useTokenData(token);

  const activeBalance = isPublic ? publicBalance : shieldedBalance;
  const isDisabled = !activeBalance || activeBalance <= 0n;

  const selectedToken = { ...token, symbol, decimals, balance: activeBalance };

  const { open: openShieldModal } = useModal();
  const { open: openSendModal } = useModal();

  const isShielding = !!useIsMutating({
    predicate: mutation => {
      const variables = mutation.state.variables as { token: Token } | undefined;
      if (!variables?.token) return false;
      return mutation.options.mutationKey?.[0] === MUTATION_KEYS.shield &&
        variables.token.address === token.address &&
        variables.token.isNative === token.isNative;
    },
  });

  const isWithdrawing = !!useIsMutating({
    predicate: mutation => {
      const variables = mutation.state.variables as { token: Token } | undefined;
      if (!variables?.token) return false;
      return mutation.options.mutationKey?.[0] === MUTATION_KEYS.withdraw &&
        variables.token.address === token.address &&
        variables.token.isNative === token.isNative;
    },
  });

  const isProcessing = isShielding || isWithdrawing;
  const processingText = isShielding ? 'Shielding' : isWithdrawing ? 'Sending privately' : undefined;

  return (
    <Container>
      <TokenIcon size={40} Icon={token.icon} />
      <Column>
        <Title>{name ?? <Skeleton style={{ height: '14px', width: '80px', marginTop: '4px' }} />}</Title>
        <Subtitle>
          {isPresent(activeBalance) && isPresent(decimals) && isPresent(activeBalance) ? formatBalance({
            balance: activeBalance,
            decimals,
          }) : <Skeleton style={{ height: '14px', width: '40px', marginTop: '4px' }} />}
          {' '}
          {symbol ?? <Skeleton style={{ height: '14px', width: '60px', marginTop: '4px' }} />}
        </Subtitle>
      </Column>
      {isPublic ? (
        <Button
          variant="primary"
          size="small"
          isLoading={isProcessing}
          leftIcon="Shielded"
          disabled={isDisabled || isProcessing}
          onClick={() => void openShieldModal(<ShieldModal token={selectedToken} />)}
        >
          {processingText ?? 'Shield'}
        </Button>
      ) : (
        <Button
          variant="primary"
          size="small"
          leftIcon="ArrowUpRight"
          isLoading={isProcessing}
          disabled={isDisabled || isProcessing}
          onClick={() => void openSendModal(<SendModal token={selectedToken} />)}
        >
          {processingText ?? 'Send'}
        </Button>
      )}
    </Container>
  );
};

export default TokenListItem;

const Container = styled.div`
  display: grid;
  
  position: relative;

  align-items: center;
  grid-template-columns: auto 1fr auto;

  width: 100%;
  padding: ${vars('--spacing-s')};

  border-radius: ${vars('--border-radius-s')};
  transition: background 0.1s;

  column-gap: ${vars('--spacing-m')};

  &:hover {
    background: ${vars('--color-neutral-background-1a-hover')};
  }

  &:active {
    background: ${vars('--color-neutral-background-1a-pressed')};
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column; 
`;

const Title = styled.p`
  ${typography.decorative.subtitle2};
`;

const Subtitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xs')};
  color: ${vars('--color-neutral-foreground-4-rest')};
  ${typography.web.caption1};
`;
