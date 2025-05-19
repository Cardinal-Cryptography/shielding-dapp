import { ComponentType } from 'react';
import styled from 'styled-components';

import { Token as TokenBase } from 'src/domains/chains/types/misc';
import definitions from 'src/domains/chains/utils/definitions';
import ScrollShadow from 'src/domains/misc/components/ScrollShadow';
import vars from 'src/domains/styling/utils/vars.ts';

import TokenListItem from './TokenListItem';

export type Token = TokenBase & {
  chain: keyof typeof definitions,
  icon: ComponentType | undefined,
};

type Props = {
  tokens: Token[],
  className?: string,
};

const TokenList = ({ tokens, className }: Props) => (
  <Container className={className}>
    {tokens.map(token => (
      <TokenListItem
        key={`${token.address ?? 'native'}-${token.chain}`}
        token={token}
      />
    )
    )}
  </Container>
);

export default TokenList;

const Container = styled(ScrollShadow)`
  height: 100%;
  width: 100%;
  padding-inline: ${vars('--spacing-m')};

  overflow: auto;

  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;
