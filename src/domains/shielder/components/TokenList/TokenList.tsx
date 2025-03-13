import styled from 'styled-components';

import ScrollShadow from 'src/domains/misc/components/ScrollShadow';
import { TokenListToken } from 'src/domains/misc/types/types';

import TokenListItem from './TokenListItem';

type Props = {
  tokens: TokenListToken[],
  onTokenClick: (token: TokenListToken) => void,
  selectedTokens?: TokenListToken[],
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
