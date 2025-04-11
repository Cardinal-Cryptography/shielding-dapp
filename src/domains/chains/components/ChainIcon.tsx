import styled from 'styled-components';

import useChain from 'src/domains/chains/utils/useChain.ts';
import vars from 'src/domains/styling/utils/vars.ts';

type Props = {
  chainId: number | string,
  size?: number,
  className?: string,
};
const ChainIcon = ({ chainId, size = 16, className }: Props) => {
  const { ChainIcon } = useChain(chainId) ?? {};

  return (
    <Container style={{ height: size, width: size, borderRadius: size * 0.25 }} className={className}>
      {ChainIcon && <ChainIcon />}
    </Container>
  );
};

export default ChainIcon;

const Container = styled.div`
  display: grid;
  place-items: center;
  border: 1px solid ${vars('--color-neutral-foreground-1-rest')};
  color: ${vars('--color-neutral-foreground-1-rest')};
  
  svg {
    height: 100%;
    width: 100%
  }
`;
