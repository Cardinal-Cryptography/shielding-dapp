import { JsonPrimitive } from 'type-fest';
import { Address, encodeFunctionData, erc20Abi } from 'viem';
import type { ContractFunctionArgs, ContractFunctionName } from 'viem';
import { estimateFeesPerGas, readContract } from 'viem/actions';

import { NetworkEnvironment, Token } from 'src/domains/chains/types/misc';

import { getPublicClient } from '../clients';
import chainsDefinitions from '../definitions/definitions';

type Chains = keyof typeof chainsDefinitions;
type Erc20Abi = typeof erc20Abi;
type Erc20Methods = ContractFunctionName<Erc20Abi, 'pure' | 'view'>;

type ExtendedJsonPrimitive = JsonPrimitive | undefined;
type ExtendedJson = ExtendedJsonPrimitive | { [key: string]: ExtendedJson } | ExtendedJson[];
type QueryConfig = {
  queryFn: () => unknown,
  cacheKeySegment: ExtendedJson[],
};

export default (networkEnvironment: NetworkEnvironment) => {
  const callErc20 = <Method extends Erc20Methods>(
    chain: Chains,
    method: Method,
    tokenAddress: Address,
    args: ContractFunctionArgs<Erc20Abi, 'pure' | 'view', Method>
  ) =>
    readContract(getPublicClient({ networkEnvironment, chain }), {
      abi: erc20Abi,
      address: tokenAddress,
      functionName: method,
      args,
    });

  return {
    tokens: ({ chain }: { chain: Chains }) => ({
      queryFn: () => Object.entries(
        chainsDefinitions[chain][networkEnvironment].whitelistedTokens
      ).map(([address]) => ({
        isNative: false,
        address,
        chain,
      } as Token)),
      cacheKeySegment: ['TOKENS'],
    }),
    tokenSymbol: ({ token }: { token: Token }) => ({
      queryFn: () =>
        token.isNative ?
          chainsDefinitions[token.chain][networkEnvironment].nativeCurrency.symbol :
          callErc20(token.chain, 'symbol', token.address, []),
      cacheKeySegment: [token],
    }),
    tokenName: ({ token }: { token: Token }) => ({
      queryFn: () => token.isNative ?
        chainsDefinitions[token.chain][networkEnvironment].nativeCurrency.name :
        callErc20(token.chain, 'name', token.address, []),
      cacheKeySegment: [token],
    }),
    tokenDecimals: ({ token }: { token: Token }) => ({
      queryFn: () => token.isNative ?
        chainsDefinitions[token.chain][networkEnvironment].nativeCurrency.name :
        callErc20(token.chain, 'decimals', token.address, []),
      cacheKeySegment: [token],
    }),
    tokenBalanceOnAccount: ({ accountAddress, token }: { accountAddress: Address, token: Token }) =>
      ({
        queryFn: () => token.isNative ?
          getPublicClient({ networkEnvironment, chain: token.chain }).getBalance({ address: accountAddress }) :
          callErc20(token.chain, 'balanceOf', token.address, [accountAddress]),
        cacheKeySegment: [token, accountAddress],
      }),
    tokenTransferFee: ({ token, from, to, amount }: { token: Token, from: Address, to: Address, amount: bigint }) => ({
      queryFn: async () => {
        const publicClient = getPublicClient({ networkEnvironment, chain: token.chain });

        const { maxFeePerGas } = await estimateFeesPerGas(publicClient);

        if (token.isNative) {const gas = await publicClient.estimateGas({
          account: from,
          to: '0x0000000000000000000000000000000000000000',
          value: 1n,
        });

        return maxFeePerGas * gas;
        } else {
          const data = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'transfer',
            args: [token.address, 1n],
          });

          const gas = await publicClient.estimateGas({
            account: from,
            to: token.address,
            data,
          });

          return maxFeePerGas * gas;
        }
      },
      cacheKeySegment: [token, from, to, amount.toString()],
    }),
  } satisfies Record<string, (...params: [never]) => QueryConfig>;
};
