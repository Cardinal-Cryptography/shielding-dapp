import styled from 'styled-components';

import TokenIcon from 'src/domains/common/components/TokenIcon';
import { typography } from 'src/domains/common/styles/tokens';
import { vars } from 'src/domains/common/styles/utils';
import { Token } from 'src/domains/common/types/types';
import formatBalance from 'src/domains/common/utils/formatBalance';
import isPresent from 'src/domains/common/utils/isPresent';

type Props = {
  token: Token,
  onTokenClick: (token: Token) => void,
};

const TokenListItem = ({ token, onTokenClick }: Props) => {
  const { name, icon, decimals, balance, usdPrice, symbol } = token;

  return (
    <Container onClick={() => void onTokenClick(token)}>
      <TokenIcon size={40} icon={icon} />
      <Column>
        <Title>{name}</Title>
        <Subtitle>${usdPrice?.toFixed(2)}</Subtitle>
      </Column>
      <Price>
        <Title>
          ${isPresent(balance) && balance.usd?.toFixed(2)}
        </Title>
        <Subtitle>
          {isPresent(balance) && isPresent(decimals) && formatBalance({
            balance: balance.atomic,
            decimals,
          })}
          {' '}
          {symbol}
        </Subtitle>
      </Price>
    </Container>
  );
};

export default TokenListItem;

const Container = styled.button`
  display: grid;

  grid-template-columns: auto 1fr auto;

  width: 100%;
  padding: ${vars('--spacing-s')};

  transition: background 0.1s;

  column-gap: ${vars('--spacing-m')};

  &:hover {
    background: rgb(0 0 0 / 10%);
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column; 
`;

const Price = styled(Column)`
  align-items: end;
`;

const Title = styled.p`
  ${typography.decorative.body1Strong};
`;

const Subtitle = styled.p`
  color: ${vars('--color-neutral-foreground-4-rest')};
  ${typography.web.caption1};
`;
