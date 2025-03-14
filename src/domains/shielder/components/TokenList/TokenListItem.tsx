import { AnimatePresence, motion } from 'motion/react';
import styled from 'styled-components';

import CIcon from 'src/domains/misc/components/CIcon';
import TokenIcon from 'src/domains/misc/components/TokenIcon';
import { Token } from 'src/domains/misc/types/types';
import isPresent from 'src/domains/misc/utils/isPresent';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  token: Token,
  onTokenClick: (token: Token) => void,
  isSelected: boolean,
};

const TokenListItem = ({ token, onTokenClick, isSelected }: Props) => {
  const { name, icon, decimals, balance, usdPrice, symbol } = token;

  return (
    <Container onClick={() => void onTokenClick(token)}>
      <AnimatePresence>
        {isSelected && (
          <Checkmark
            initial={{ x: 5,y: '-50%', opacity: 0 }}
            animate={{ x: 0,y: '-50%', opacity: 1 }}
            exit={{ y: '-50%', opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.1 }}
          >
            <CIcon icon="CheckmarkRegular" size={14} />
          </Checkmark>
        )}
      </AnimatePresence>
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
  
  position: relative;

  grid-template-columns: auto 1fr auto;

  width: 100%;
  padding: ${vars('--spacing-s')};

  transition: background 0.1s;

  column-gap: ${vars('--spacing-m')};

  &:hover {
    background: rgb(0 0 0 / 5%);
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

const Checkmark = styled(motion.div)`
  display: grid;

  position: absolute;
  top: 50%;
  left: 0;

  place-items: center;

  height: 20px;
  width: 20px;

  border-radius: ${vars('--border-radius-circular')};
  background: red;
  background: ${vars('--color-brand-background-2-rest')};
  transform: translateY(-50%);

  aspect-ratio: 1/1;
`;
