import { JsonPrimitive } from 'type-fest';
import { Address, encodeFunctionData, erc20Abi, WalletClient } from 'viem';

import { NetworkEnvironment, Token } from 'src/domains/chains/types/misc';

import chainsDefinitions from '../definitions/definitions';
import getQueriesConfigs from '../queriesParams/getQueriesConfigs';

type ExtendedJsonPrimitive = JsonPrimitive | undefined;
type ExtendedJson = ExtendedJsonPrimitive | { [key: string]: ExtendedJson } | ExtendedJson[];
type MutationConfig = {
  mutationFn: () => unknown,
  cacheKeysSegmentsToInvalidate: ExtendedJson[],
};

export default (networkEnvironment: NetworkEnvironment) => ({
  transferTokens: ({
    walletClient,
    token,
    from,
    to,
    amount,
  }: {
    walletClient: WalletClient,
    token: Token,
    from: Address,
    to: Address,
    amount: bigint,
  }) => ({
    mutationFn: async () => {
      const {
        id,
        name,
        nativeCurrency,
        rpcUrls,
        blockExplorers,
      } = chainsDefinitions[token.chain][networkEnvironment];
      const chain = {
        id,
        name,
        nativeCurrency,
        rpcUrls,
        blockExplorers,
      };

      if (token.isNative) {
        return walletClient.sendTransaction({
          account: from,
          to,
          value: amount,
          chain,
        });
      }

      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [to, amount],
      });

      return walletClient.sendTransaction({
        account: from,
        to: token.address,
        data,
        chain,
      });
    },
    cacheKeysSegmentsToInvalidate: [
      getQueriesConfigs(networkEnvironment).tokenBalanceOnAccount({ token, accountAddress: from }).cacheKeySegment,
      getQueriesConfigs(networkEnvironment).tokenBalanceOnAccount({ token, accountAddress: to }).cacheKeySegment,
    ],
  }),
} satisfies Record<string, (...params: [never]) => MutationConfig>);
