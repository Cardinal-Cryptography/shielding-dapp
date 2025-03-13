import { erc20Token, nativeToken, Token as SDKToken } from '@cardinal-cryptography/shielder-sdk';
import { useAppKitNetwork } from '@reown/appkit/react';
import { useQuery } from '@tanstack/react-query';
import { erc20Abi } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';

import { Token } from 'src/domains/chains/types/misc';
import useShielderClient from 'src/domains/shielder/utils/useShielderClient';

const tokenToSdkToken = (token: Token): SDKToken =>
  token.isNative ? nativeToken() : erc20Token(token.address);

export const useTokensBalance = ({ tokens }: { tokens: Token[] }) => {
  const { address: walletAddress } = useAccount();
  const { data: shielderClient } = useShielderClient();
  const publicClient = usePublicClient();
  const { chainId } = useAppKitNetwork();

  const balanceQuery = useQuery({
    queryKey: ['combinedBalances', walletAddress, chainId],
    enabled: !!walletAddress && !!shielderClient && !!publicClient && !!chainId,
    queryFn: async () => {
      if (!walletAddress) throw new Error('Wallet address not available');
      if (!publicClient) throw new Error('Public client not available');

      return await Promise.all(
        tokens.map(async token => {
          const publicBalance = token.isNative ?
            await publicClient.getBalance({ address: walletAddress }) :
            await publicClient.readContract({
              address: token.address,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [walletAddress],
            });

          const shieldedBalance = shielderClient ?
            (await shielderClient.accountState(tokenToSdkToken(token)))?.balance ?? 0n :
            0n;

          return { public: publicBalance, shielded: shieldedBalance };
        })
      );
    },
  });

  return balanceQuery;
};
