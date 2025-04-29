import { ComponentType } from 'react';
import styled from 'styled-components';

import { Token as TokenBase } from 'src/domains/chains/types/misc';
import definitions from 'src/domains/chains/utils/definitions';
import ScrollShadow from 'src/domains/misc/components/ScrollShadow';

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
  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;
