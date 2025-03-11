import styled from 'styled-components';

import ScrollShadow from 'src/domains/common/components/ScrollShadow';
import { Token } from 'src/domains/common/types/types';

import TokenListItem from './TokenListItem';

type Props = {
  tokens: Token[],
  onTokenClick: (token: Token) => void,
  className?: string,
};

const TokenList = ({ tokens, onTokenClick, className }: Props) => (
  <Container className={className}>
    {tokens.map(token => <TokenListItem onTokenClick={onTokenClick} key={token.address} token={token} />)}
  </Container>
);

export default TokenList;

const Container = styled(ScrollShadow)`
  width: min(100vw, 440px);
`;
