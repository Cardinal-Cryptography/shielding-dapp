import styled from 'styled-components';

import Button from 'src/domains/misc/components/Button';
import Skeleton from 'src/domains/misc/components/Skeleton';
import TokenIcon from 'src/domains/misc/components/TokenIcon';
import isPresent from 'src/domains/misc/utils/isPresent';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import { useShielderStore } from 'src/domains/shielder/stores/shielder';
import useToken from 'src/domains/shielder/utils/useToken';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import ShieldModal from './Modals';
import SendModal from './Modals/SendModal/SendModal';

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
  } = useToken(token);

  const activeBalance = isPublic ? publicBalance : shieldedBalance;
  const isDisabled = !activeBalance || activeBalance <= 0n;

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
        <ShieldModal token={{ ...token, symbol, decimals, balance: publicBalance }}>
          <Button
            variant="primary"
            size="small"
            leftIcon="Shielded"
            disabled={isDisabled}
          >
            Shield
          </Button>
        </ShieldModal>
      ) : (
        <SendModal token={{ ...token, symbol, decimals, balance: shieldedBalance }}>
          <Button
            variant="primary"
            size="small"
            leftIcon="ArrowUpRight"
            disabled={isDisabled}
          >
            Send
          </Button>
        </SendModal>
      )}
    </Container>
  );
};

export default TokenListItem;

const Container = styled.div`
  display: grid;
  
  position: relative;

  grid-template-columns: auto 1fr auto;

  width: 100%;
  padding: ${vars('--spacing-s')};

  transition: background 0.1s;

  column-gap: ${vars('--spacing-m')};
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
