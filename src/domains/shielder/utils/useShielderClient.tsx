import {
  createShielderClient, ShielderTransaction,
} from '@cardinal-cryptography/shielder-sdk';
import { skipToken, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePublicClient } from 'wagmi';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import { getShielderIndexedDB } from 'src/domains/shielder/stores/getShielderIndexedDB';
import { getTransactionsIndexedDB } from 'src/domains/shielder/stores/getShielderIndexedDB';
import { useShielderStore } from 'src/domains/shielder/stores/shielder';
import { useWasm } from 'src/domains/shielder/utils/WasmProvider';

const useShielderClient = () => {
  const chainConfig = useChain();
  const { wasmCryptoClient, wasmLoaded } = useWasm();

  const publicClient = usePublicClient({ chainId: chainConfig?.id });
  const { address: account } = useWallet();
  const { shielderPrivateKey } = useShielderStore(account);

  const isQueryDisabled =
      !publicClient || !chainConfig || !wasmLoaded || !account || !wasmCryptoClient || !shielderPrivateKey;

  return useQuery({
    queryKey: chainConfig && shielderPrivateKey ? getQueryKey.shielderClient(chainConfig.id, shielderPrivateKey) : [],
    staleTime: Infinity,
    retry: false,
    queryFn: isQueryDisabled ? skipToken : async () => {
      const { shielderConfig, id } = chainConfig;

      if (!shielderConfig) {
        throw new Error('Shielder config is not available');
      }

      const storage = getTransactionsIndexedDB(account);

      const client = createShielderClient({
        shielderSeedPrivateKey: shielderPrivateKey,
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
