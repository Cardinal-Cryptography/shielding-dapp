import BigNumber from 'bignumber.js';

export default (balance: bigint | BigNumber, decimals: number) => {
  const bigNumberBalance = BigNumber.isBigNumber(balance) ? balance : BigNumber(balance.toString());

  if (decimals === 0) return bigNumberBalance;

  return bigNumberBalance.shiftedBy(decimals * -1);
};
