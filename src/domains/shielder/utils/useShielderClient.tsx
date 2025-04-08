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
import { useWasm } from 'src/domains/shielder/utils/WasmProvider';

const useShielderClient = () => {
  const chainConfig = useChain();
  const { wasmCryptoClient, wasmLoaded } = useWasm();

  const publicClient = usePublicClient({ chainId: chainConfig?.id });
  const { address: accountAddress, privateKey } = useWallet();

  const isQueryDisabled =
      !publicClient || !chainConfig || !wasmLoaded || !accountAddress || !wasmCryptoClient || !privateKey;

  return useQuery({
    queryKey: chainConfig && privateKey ? getQueryKey.shielderClient(chainConfig.id, privateKey) : [],
    staleTime: Infinity,
    queryFn: isQueryDisabled ? skipToken : async () => {
      const { shielderConfig, id: chainId } = chainConfig;

      if (!shielderConfig) {
        throw new Error('Shielder config is not available');
      }

      const transactionsStorage = getTransactionsIndexedDB(accountAddress);
      const shielderStorage = getShielderIndexedDB(chainId, privateKey);

      const client = createShielderClient({
        shielderSeedPrivateKey: privateKey,
        chainId: BigInt(chainId),
        publicClient,
        contractAddress: shielderConfig.shielderContractAddress,
        relayerUrl: shielderConfig.relayerUrl,
        storage: shielderStorage,
        cryptoClient: wasmCryptoClient,
        callbacks: {
          onNewTransaction: async (tx: ShielderTransaction) => {
            await transactionsStorage.addItem(
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
