import { expect, test } from 'vitest';

import queriesParams from './queriesParams';

test('returns proper React Query parameters', () => {
  expect(queriesParams.testnet.tokenBalanceOnAccount({
    accountAddress: '0x0',
    token: {
      chain: 'alephZero',
      isNative: true,
    },
  })).toEqual({
    queryFn: expect.any(Function),
    queryKey: [
      'CHAINS',
      'testnet',
      'tokenBalanceOnAccount',
      {
        chain: 'alephZero',
        isNative: true,
      },
      '0x0',
    ],
  });
});
