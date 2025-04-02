import {
  createShielderClient, ShielderTransaction,
} from '@cardinal-cryptography/shielder-sdk';
import { skipToken, useQuery } from '@tanstack/react-query';
import { signMessage } from '@wagmi/core';
import { toast } from 'sonner';
import { keccak256, toHex } from 'viem';
import { usePublicClient } from 'wagmi';

import { useWallet } from 'src/domains/chains/components/WalletProvider.tsx';
import { wagmiAdapter } from 'src/domains/chains/utils/clients';
import useChain from 'src/domains/chains/utils/useChain.ts';
import getQueryKey from 'src/domains/misc/utils/getQueryKey.ts';
import { getShielderIndexedDB } from 'src/domains/shielder/stores/getShielderIndexedDB.ts';
import { getTransactionsIndexedDB } from 'src/domains/shielder/stores/getShielderIndexedDB.ts';
import { useShielderStore } from 'src/domains/shielder/stores/shielder.ts';
import { useWasm } from 'src/domains/shielder/utils/WasmProvider';

const useShielderClient = () => {
  const chainConfig = useChain();
  const { wasmCryptoClient, wasmLoaded } = useWasm();

  const publicClient = usePublicClient({ chainId: chainConfig?.id });
  const { address: account } = useWallet();
  const { shielderPrivateKey, setShielderPrivateKeySeeds } = useShielderStore(account);

  const getShielderPrivateKey = async () => {
    if(!account || !!shielderPrivateKey) return shielderPrivateKey;

    // TODO(SD-30): Replace placeholder with proper message for common wallet usage.
    // https://cardinal-cryptography.atlassian.net/browse/SD-30

    const message = `I love common wallet on account - ${account}`;
    const signature = await signMessage(wagmiAdapter.wagmiConfig,{
      message,
    });

    const key = keccak256(toHex(signature));
    setShielderPrivateKeySeeds(account, key);
    return key;
  };
  const isQueryDisabled =
      !publicClient || !chainConfig || !wasmLoaded || !account || !wasmCryptoClient;

  return useQuery({
    queryKey: chainConfig && shielderPrivateKey ? getQueryKey.shielderClient(chainConfig.id, shielderPrivateKey) : [],
    queryFn: isQueryDisabled ? skipToken : async () => {
      const { shielderConfig, id } = chainConfig;

      const privateKey = await getShielderPrivateKey();

      if (!privateKey) {
        throw new Error('shielderSeedPrivateKey is missing');
      }

      if (!shielderConfig) {
        throw new Error('Shielder config is not available');
      }

      const storage = getTransactionsIndexedDB(account);

      const client = createShielderClient({
        shielderSeedPrivateKey: privateKey,
        chainId: BigInt(id),
        publicClient,
        contractAddress: shielderConfig.shielderContractAddress,
        relayerUrl: shielderConfig.relayerUrl,
        storage: getShielderIndexedDB(id),
        cryptoClient: wasmCryptoClient,
        callbacks: {
          onNewTransaction: async (tx: ShielderTransaction) => {
            await storage.addItem(
              chainConfig.id,
              tx
            );
          },
          onCalldataGenerated: calldata => {
            toast.info('Proof generated',{
              description: `Proof generated in ${calldata.provingTimeMillis}ms`,
            });
          },
        },
      });

      await client.syncShielder();

      return client;
    },
  });
};

export default useShielderClient;
