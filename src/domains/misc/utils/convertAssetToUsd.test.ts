import { expect, test } from 'vitest';

import convertAssetToUsd from './convertAssetToUsd';

const usdPrice = 0.48888;
const amount = 111n * 10n ** 18n;
const decimals = 18;

test.each<{
  key: string,
  params: Parameters<typeof convertAssetToUsd>,
}>([
  {
    key: 'amount',
    params: [usdPrice, undefined, decimals],
  },
  {
    key: 'usdPrice',
    params: [undefined, amount, decimals],
  },
  {
    key: 'decimals',
    params: [usdPrice, amount, undefined],
  },
])('Returns undefined usd asset value and formatted value if $key is undefined', ({ params }) => {
  expect(convertAssetToUsd(...params)).toEqual({
    assetUsdValue: undefined,
    assetUsdValueFormatted: undefined,
  });
});

test('Returns asset usd value and formatted value rounded down to 2 decimal places', () => {
  // before rounding 54.2679
  expect(convertAssetToUsd(usdPrice, amount, decimals)).toEqual({
    assetUsdValue: 54.26,
    assetUsdValueFormatted: '54.26',
  });
});

test('Returns asset usd formatted value with "$" prefix', () => {
  expect(convertAssetToUsd(usdPrice, amount, decimals, true)).toEqual({
    assetUsdValue: 54.26,
    assetUsdValueFormatted: '$54.26',
  });
});
