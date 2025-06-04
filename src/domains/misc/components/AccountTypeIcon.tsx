import styled, { css } from 'styled-components';

import ChainIcon from 'src/domains/chains/components/ChainIcon';
import CIcon from 'src/domains/misc/components/CIcon';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  type: 'public' | 'shielded',
  size: number,
  className?: string,
  withBorder?: boolean,
  chainId?: string | number,
};

const AccountTypeIcon = ({ type, size, className, withBorder, chainId }: Props) => (
  <Wrapper>
    <IconWrapper className={className} $size={size} $withBorder={withBorder}>
      <CIcon
        icon={type === 'public' ? 'PersonFilled' : 'ShieldedFilled'}
        size={size / 1.6}
      />
    </IconWrapper>
    {chainId && (
      <ChainIconWrapper>
        <ChainIcon chainId={chainId} />
      </ChainIconWrapper>
    )}
  </Wrapper>
);

export default styled(AccountTypeIcon)``;

const IconWrapper = styled.div<{ $size: number, $withBorder?: boolean }>`
  display: grid;

  position: relative;

  place-items: center;
  
  height: ${({ $size }) => `${$size}px`};
  width: ${({ $size }) => `${$size}px`};


  color: ${vars('--color-neutral-foreground-static-rest')};



  border-radius: ${vars('--border-radius-circular')};
  background: linear-gradient(135deg, #cce0ff 0%, #6fa1eb 100%);



  ${({ $withBorder }) => $withBorder && css`
    border: 1px solid ${vars('--color-neutral-stroke-subtle-rest')};
  `}
`;

const ChainIconWrapper = styled.div`
  position: absolute;
  right: calc(${vars('--spacing-xxs')} * -1);
  bottom: calc(${vars('--spacing-xxs')} * -1);

  padding: ${vars('--spacing-xxs')};

  border-radius: ${vars('--border-radius-s-nudge-2')};
  background: inherit;
`;

const Wrapper = styled.div`
  position: relative;
  background: inherit;
`;
