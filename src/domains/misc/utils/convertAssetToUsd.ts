import BigNumber from 'bignumber.js';
import { isNullish } from 'utility-types';

import formatBalance from 'src/domains/numbers/utils/formatBalance';
import getBalanceWithDecimals from 'src/domains/numbers/utils/getBalanceWithDecimals';

const PRECISION = 4;

export default (
  usdPrice: number | undefined,
  amount: bigint | undefined,
  decimals: number | undefined,
  withPrefix = false,
) => {
  if (isNullish(amount) || isNullish(usdPrice) || isNullish(decimals)) {
    return {
      assetUsdValue: undefined,
      assetUsdValueFormatted: undefined,
    };
  }
  const amountTimesUsdPriceShiftedByPrecision = BigInt(Math.round(usdPrice * 10 ** PRECISION)) * amount;
  const assetUsdValue = (
    getBalanceWithDecimals(amountTimesUsdPriceShiftedByPrecision, decimals + PRECISION)
      .dp(2, BigNumber.ROUND_DOWN)
      .toNumber()
  );
  const assetUsdValueFormatted = formatBalance({
    balance: amountTimesUsdPriceShiftedByPrecision,
    decimals: decimals + PRECISION,
    options: { prefix: withPrefix ? '$' : '' },
  });
  return {
    assetUsdValue,
    assetUsdValueFormatted,
  };
};
