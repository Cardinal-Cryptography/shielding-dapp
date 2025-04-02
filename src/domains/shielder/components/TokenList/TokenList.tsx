import { ComponentType } from 'react';
import styled from 'styled-components';

import { Token as TokenBase } from 'src/domains/chains/types/misc';
import definitions from 'src/domains/chains/utils/definitions';
import ScrollShadow from 'src/domains/misc/components/ScrollShadow';

import TokenListItem from './TokenListItem';

export type Token = TokenBase & {
  chain: keyof typeof definitions,
  name: string | undefined,
  symbol: string | undefined,
  address: string | undefined,
  decimals: number | undefined,
  icon: ComponentType | undefined,
  balance?: {
    atomic?: bigint | string | number,
    usd?: number,
  },
  usdPrice?: number,
};

type Props = {
  tokens: Token[],
  onTokenClick: (token: Token) => void,
  selectedTokens?: Token[],
  className?: string,
};

const TokenList = ({ tokens, onTokenClick, className, selectedTokens }: Props) => (
  <Container className={className}>
    {tokens.map(token => (
      <TokenListItem
        onTokenClick={onTokenClick}
        key={`${token.address ?? 'native'}-${token.chain}`}
        token={token}
        isSelected={selectedTokens?.some(t => t.address === token.address) ?? false}
      />
    )
    )}
  </Container>
);

export default TokenList;

const Container = styled(ScrollShadow)`
  height: 100%;
  width: min(100vw, 440px);
  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;
