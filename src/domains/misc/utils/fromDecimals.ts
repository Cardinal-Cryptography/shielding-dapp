import BigNumber from 'bignumber.js';

export default (balance: number | string | BigNumber, decimals: number) => {
  // Limiting decimal points since received balance may have more decimals than the token, leading to leftover decimals after shifting the balance, causing BN.js to fail.
  const balanceBigNumber = BigNumber(balance).dp(decimals, BigNumber.ROUND_FLOOR);

  const bigNumber = balanceBigNumber.lte(0) || balanceBigNumber.isNaN() ?
    0 :
    balanceBigNumber.shiftedBy(decimals).toFixed();

  return BigInt(bigNumber);
};
