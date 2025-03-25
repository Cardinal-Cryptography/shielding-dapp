import styled from 'styled-components';

import ScrollShadow from 'src/domains/misc/components/ScrollShadow';
import { Token } from 'src/domains/misc/types/types';

import TokenListItem from './TokenListItem';

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
        key={token.address}
        token={token}
        isSelected={selectedTokens?.some(t => t.address === token.address) ?? false}
      />
    )
    )}
  </Container>
);

export default TokenList;

const Container = styled(ScrollShadow)`
  width: min(100vw, 440px);
`;
