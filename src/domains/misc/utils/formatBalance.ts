import BigNumber from 'bignumber.js';

import getBalanceWithDecimals from './getBalanceWithDecimals';

const formatConfig = {
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
};

type Options = Partial<{
  formatDecimals: number,
  prefix: string,
  withPlusSign: boolean,
}>;

const defaultOptions = {
  formatDecimals: 2,
  prefix: '',
  withPlusSign: false,
} satisfies Options;

type Params = {
  balance: bigint | BigNumber | string | number,
  decimals: number,
  options?: Options,
};

/**
 * Get an easily readable format of the balance, ready to be displayed.
 */
export default ({ balance, decimals, options }: Params) => {
  const { formatDecimals, prefix, withPlusSign } = {
    ...defaultOptions,
    ...options,
  };
  const bigNumberBalance = BigNumber(balance.toString());
  const isNegative = bigNumberBalance.isNegative();
  const plusOrMinus = isNegative ? '-' : withPlusSign ? '+' : '';
  const signWithPrefix = `${plusOrMinus}${prefix}`;

  if (decimals === 0) {
    const newBalance = bigNumberBalance
      .dp(formatDecimals, BigNumber.ROUND_DOWN) // ROUND_DOWN rounds both positive and negative numbers towards zero
      .abs()
      .toFormat(formatConfig);
    return `${signWithPrefix}${newBalance}`;
  }

  const newBalance = (
    getBalanceWithDecimals(bigNumberBalance, decimals)
      .dp(formatDecimals, BigNumber.ROUND_DOWN)
      .abs()
      .toFormat(formatConfig)
  );

  const isVerySmall = Number(newBalance) === 0;
  const isZero = bigNumberBalance.isZero();

  if (isZero) return `${prefix}0.00`;

  if (isVerySmall) {
    return `${plusOrMinus ? `${plusOrMinus} ` : ''}<${prefix}0.${'1'.padStart(formatDecimals, '0')}`;
  }

  return `${signWithPrefix}${newBalance}`;
};
