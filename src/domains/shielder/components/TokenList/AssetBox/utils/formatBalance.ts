import BigNumber from 'bignumber.js';

import getHumanFriendlyBigNumber from './getHumanFriendlyBigNumber';

const formatConfig = {
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
};

/**
 * Get an easily readable format of the balance, ready to be displayed.
 */
export default (balance: bigint, decimals: number, formatDecimals = 2) => {
  const bigNumberBalance = BigNumber(balance.toString());

  if (decimals === 0) return bigNumberBalance.dp(formatDecimals, BigNumber.ROUND_FLOOR).toFormat(formatConfig);

  const newBalance = (
    getHumanFriendlyBigNumber(bigNumberBalance, decimals)
      .dp(formatDecimals, BigNumber.ROUND_FLOOR).toFormat(formatConfig)
  );

  const isVerySmall = Number(newBalance) === 0;
  const isZero = bigNumberBalance.isZero();

  if (isZero) return '0.00';

  if (isVerySmall) return `<0.${'1'.padStart(formatDecimals, '0')}`;

  return newBalance;
};
