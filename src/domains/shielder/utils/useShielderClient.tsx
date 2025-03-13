import {
  createShielderClient,
} from '@cardinal-cryptography/shielder-sdk';
import { useQuery } from '@tanstack/react-query';
import { signMessage } from '@wagmi/core';
import { keccak256, toHex } from 'viem';
import { usePublicClient } from 'wagmi';

import { useWallet } from 'src/domains/chains/components/WalletProvider.tsx';
import { wagmiAdapter } from 'src/domains/chains/utils/clients';
import useChain from 'src/domains/chains/utils/useChain.ts';
import { useShielderStore } from 'src/domains/shielder/stores/shielder.ts';
import { shielderIndexedDB } from 'src/domains/shielder/stores/shielderIndexedDB.ts';
import { useWasm } from 'src/domains/shielder/utils/WasmProvider';

const useShielderClient = () => {
  const chainConfig = useChain();
  const { wasmCryptoClient, wasmLoaded } = useWasm();

  const publicClient = usePublicClient({ chainId: chainConfig?.id });
  const { address: account } = useWallet();
  const { shielderPrivateKey, setShielderPrivateKeySeeds } = useShielderStore(account);

  const generateMnemonic = async () => {
    if(!account || !!shielderPrivateKey) return shielderPrivateKey;

    const message = `I love common wallet on account - ${account}`;
    const signature = await signMessage(wagmiAdapter.wagmiConfig,{
      message,
    });

    const key = keccak256(toHex(signature));
    setShielderPrivateKeySeeds(account, key);
    return key;
  };

  return useQuery({
    enabled: !!publicClient && !!chainConfig && wasmLoaded,
    queryKey: [
      'shielderClient',
      chainConfig?.id,
      wasmLoaded,
      shielderPrivateKey,
    ],
    queryFn: async () => {
      if (!wasmLoaded || !wasmCryptoClient) {
        throw new Error('Wasm not loaded');
      }

      if(!publicClient) {
        throw new Error('Public client not available');
      }

      if(!chainConfig) {
        throw new Error('Chain config not available');
      }

      const { shielderConfig, id } = chainConfig;

      const privateKey = await generateMnemonic();

      if (!privateKey) {
        throw new Error('shielderSeedPrivateKey is missing');
      }

      if (!shielderConfig) {
        throw new Error('Shielder config is not available');
      }

      const client = createShielderClient({
        shielderSeedPrivateKey: privateKey,
        chainId: BigInt(id),
        publicClient,
        contractAddress: shielderConfig.shielderContractAddress,
        relayerUrl: shielderConfig.relayerUrl,
        storage: shielderIndexedDB(id),
        cryptoClient: wasmCryptoClient,
        callbacks: {
          // onNewTransaction: async (tx: ShielderTransaction) => {
          //   await insertTransaction.mutateAsync(tx);
          //   toast({
          //     title: 'Transaction completed',
          //     description: `Transaction ${tx.type} completed`,
          //   });
          //   refetchTransactions();
          //   queryClient.invalidateQueries({
          //     queryKey: ['tokenBalance', tx.token],
          //   });
          // },
          // onCalldataGenerated: async calldata => {
          //   saveLatestProof.mutate(calldata.provingTimeMillis);
          //   toast({
          //     title: 'Proof generated',
          //     description: `Proof generated in ${calldata.provingTimeMillis}ms`,
          //   });
          // },
        },
      });
      // Sync the native token
      void client.syncShielder();

      return client;
    },
  });
};

export default useShielderClient;
