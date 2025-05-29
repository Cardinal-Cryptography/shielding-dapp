import { Buffer } from 'buffer';

import {
  createShielderClient,
  ShielderTransaction,
} from '@cardinal-cryptography/shielder-sdk';
import { DepositCalldata } from '@cardinal-cryptography/shielder-sdk/dist/actions/deposit';
import { NewAccountCalldata } from '@cardinal-cryptography/shielder-sdk/dist/actions/newAccount';
import { WithdrawCalldata } from '@cardinal-cryptography/shielder-sdk/dist/actions/withdraw';
import { skipToken, useQuery } from '@tanstack/react-query';
import { getPublicClient } from '@wagmi/core';
import styled from 'styled-components';
import { usePublicClient } from 'wagmi';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import { wagmiAdapter } from 'src/domains/chains/utils/clients';
import useChain from 'src/domains/chains/utils/useChain';
import { useModal } from 'src/domains/misc/components/ModalNew';
import { useToast } from 'src/domains/misc/components/Toast';
import getQueryKey from 'src/domains/misc/utils/getQueryKey';
import TransactionDetailsModal
  from 'src/domains/shielder/components/TransactionDetailsModal';
import {
  getShielderIndexedDB,
} from 'src/domains/shielder/stores/getShielderIndexedDB';
import { useWasm } from 'src/domains/shielder/utils/WasmProvider';
import { useTransactionsHistory } from 'src/domains/shielder/utils/useTransactionsHistory.tsx';
import vars from 'src/domains/styling/utils/vars';

const TWO_MINUTES = 2 * 60 * 1000;

const provingTimeMap = new Map<string, number>();

const useShielderClient = () => {
  const chainConfig = useChain();
  const { wasmCryptoClient, wasmLoaded } = useWasm();
  const { showToast } = useToast();
  const { open } = useModal();

  const publicClient = usePublicClient({ chainId: chainConfig?.id });
  const { address: accountAddress, privateKey } = useWallet();
  const { upsertTransaction } = useTransactionsHistory();

  const isQueryDisabled =
    !publicClient ||
    !chainConfig ||
    !wasmLoaded ||
    !accountAddress ||
    !wasmCryptoClient ||
    !privateKey;

  return useQuery({
    queryKey:
      chainConfig && privateKey ?
        getQueryKey.shielderClient(chainConfig.id, privateKey) :
        [],
    staleTime: Infinity,
    queryFn: isQueryDisabled ?
      skipToken :
      async () => {
        const { shielderConfig, id: chainId } = chainConfig;

        if (!shielderConfig) {
          throw new Error('Shielder config is not available');
        }

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
            onCalldataGenerated: calldata => {
              const { calldata: cdataInner, provingTimeMillis } = calldata as
                DepositCalldata | NewAccountCalldata | WithdrawCalldata;

              const pubInputs = cdataInner.pubInputs;
              const hNoteBytes = 'hNoteNew' in pubInputs ? pubInputs.hNoteNew.bytes : pubInputs.hNote.bytes;

              const key = Buffer.from(hNoteBytes).toString('hex');
              provingTimeMap.set(key, provingTimeMillis);

              showToast({
                title: 'Proof generated',
                status: 'information',
                body: `Proof generated in ${provingTimeMillis}ms`,
              });
            },
            onNewTransaction: async (tx: ShielderTransaction) => {
              const getTimestamp = async () => {
                const client = getPublicClient(wagmiAdapter.wagmiConfig);

                if(!client) {
                  console.warn('No client available for fetching accurate timestamp');
                  return;
                }

                try {
                  const receipt = await client.waitForTransactionReceipt({ hash: tx.txHash });
                  const block = await client.getBlock({ blockHash: receipt.blockHash });
                  return Number(block.timestamp) * 1000;
                } catch (error) {
                  console.warn('Failed to fetch accurate timestamp for tx', tx.txHash, error);
                  return;
                }
              };
              const timestamp = await getTimestamp();

              await upsertTransaction(chainConfig.id, {
                ...tx,
                status: 'completed',
                completedTimestamp: timestamp,
              });

              if (timestamp && Date.now() - timestamp <= TWO_MINUTES) {
                showToast({
                  title: tx.type === 'Withdraw' ? 'Sent privately' : 'Shielded',
                  status: 'success',
                  body: (
                    <DetailsButton
                      onClick={() => void open(<TransactionDetailsModal txHash={tx.txHash} />)}
                    >
                      See details
                    </DetailsButton>
                  ),
                });
              }
            },
          },
        });

        await client.syncShielder();

        return client;
      },
  });
};

export default useShielderClient;

const DetailsButton = styled.button`
  color: ${vars('--color-brand-foreground-link-rest')};

  &:hover {
    color: ${vars('--color-brand-foreground-link-hover')};
  }

  &:active {
    color: ${vars('--color-brand-foreground-link-pressed')};
  }
`;
