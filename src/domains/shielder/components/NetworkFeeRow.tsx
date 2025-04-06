import styled, { css } from 'styled-components';

import useChain from 'src/domains/chains/utils/useChain';
import InfoPair from 'src/domains/misc/components/InfoPair';
import Skeleton from 'src/domains/misc/components/Skeleton';
import TokenIcon from 'src/domains/misc/components/TokenIcon';
import isPresent from 'src/domains/misc/utils/isPresent';
import formatBalance from 'src/domains/numbers/utils/formatBalance';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  transactionFee: bigint | undefined,
  isError?: boolean,
};

const NetworkFeeRow = ({ transactionFee, isError }: Props) => {
  const chainConfig = useChain();
  const nativeToken = chainConfig?.nativeCurrency;

  return (
    <InfoPair
      label="Network fee"
      value={
        isPresent(nativeToken?.decimals) && isPresent(transactionFee) ? (
          <Fee $isError={!!isError}>
            <TokenIcon Icon={chainConfig?.NativeTokenIcon} />
            {formatBalance({ balance: transactionFee, decimals: nativeToken.decimals })}
            {' '}
            {chainConfig?.nativeCurrency.symbol}
          </Fee>
        ) : (
          <Skeleton style={{ height: 10 }} />
        )
      }
    />
  );
};

export default NetworkFeeRow;

const Fee = styled.div<{ $isError: boolean }>`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-s')};
  ${({ $isError }) => $isError && css`
    color: ${vars('--color-status-danger-foreground-1-rest')};
  `};
`;
