import styled, { css } from 'styled-components';

import supportedChains from 'src/domains/chains/utils/supportedChains';
import useChain from 'src/domains/chains/utils/useChain';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  chainId: number | string,
  size?: number,
  className?: string,
};
const { testnet } = supportedChains;

const ChainIcon = ({ chainId, size = 16, className }: Props) => {
  const { ChainIcon } = useChain(chainId) ?? {};
  const isTestnet = testnet.some(c => c.id === chainId);

  return (
    <Container
      $isTestnet={isTestnet}
      style={{ height: size, width: size, borderRadius: size * 0.25 }}
      className={className}
    >
      {ChainIcon && <ChainIcon />}
    </Container>
  );
};

export default ChainIcon;

const Container = styled.div<{ $isTestnet: boolean }>`
  display: grid;
  place-items: center;
  border: 1px solid ${vars('--color-neutral-foreground-1-rest')};
  color: ${vars('--color-neutral-foreground-1-rest')};
  
  ${({ $isTestnet }) => $isTestnet && css`
    border-style: dashed;
  `}
  
  svg {
    height: 100%;
    width: 100%
  }
`;
