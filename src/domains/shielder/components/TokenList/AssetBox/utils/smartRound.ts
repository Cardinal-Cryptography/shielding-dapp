import BigNumber from 'bignumber.js';
import { isNullish } from 'utility-types';

/**
 * Rounds a numeric value while keeping a variable number of significant digits after leading zeros, determined by the precision.
 */
export default (value: BigNumber | number | undefined , precision?: number) => {
  if (!value) return '';

  const bigNumberValue = BigNumber(value);

  if (isNullish(precision)) return bigNumberValue.toFixed();

  // Using rounding mode 3 (floor) to avoid exceeding any potential values limits
  if (bigNumberValue.gte(1)) return bigNumberValue.dp(precision, 3).toFixed();

  const [whole, decimals] = bigNumberValue.toFixed().split('.');

  if (!decimals) return bigNumberValue.toFixed();

  const i = decimals.split('').findIndex(d => d !== '0');
  return `${whole}.${decimals.slice(0, i + precision)}`;
};
