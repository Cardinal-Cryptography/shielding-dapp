import { useCallback } from 'react';

import { useModals } from 'src/domains/misc/components/Modal';
import TransactionDetailsModal from 'src/domains/shielder/components/TransactionDetailsModal';
import { PartialLocalShielderActivityHistory } from 'src/domains/shielder/stores/getShielderIndexedDB';
import { useTransactionsHistory } from 'src/domains/shielder/utils/useTransactionsHistory.tsx';

/**
 * Custom hook to handle transaction details modal logic.
 * Fetches the latest transaction data and opens a modal with up-to-date information.
 * Handles modal ID transitions when transactions move from pending (localId only)
 * to confirmed state (both localId and txHash), preventing duplicate modals.
 */
const useTransactionDetailsModal = () => {
  const { mount, updateId } = useModals();
  const { refetch } = useTransactionsHistory();

  const openTransactionModal = useCallback(async (tx: PartialLocalShielderActivityHistory) => {
    const { data } = await refetch();
    const thisTransaction =
      data?.find(transaction => transaction.txHash === tx.txHash || transaction.localId === tx.localId);

    const modalId = tx.txHash ?? tx.localId;

    const modalProps = tx.txHash ?
      { txHash: tx.txHash } :
      { localId: tx.localId };

    const updatedModal = thisTransaction?.localId && thisTransaction.txHash ?
      await updateId(thisTransaction.localId, thisTransaction.txHash) :
      null;

    if(updatedModal) {
      console.warn('Transaction modal is already open, updating to new ID:', updatedModal.id);
      return;
    }

    mount({
      id: modalId,
      modal: <TransactionDetailsModal {...modalProps} />,
    });
  }, [mount, refetch, updateId]);

  return {
    openTransactionModal,
  };
};

export default useTransactionDetailsModal;
