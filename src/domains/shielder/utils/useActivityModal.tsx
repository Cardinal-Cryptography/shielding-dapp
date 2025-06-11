import { useCallback } from 'react';

import { useModal } from 'src/domains/misc/components/Modal';
import ActivityDetailsModal from 'src/domains/shielder/components/TransactionDetailsModal';
import { PartialLocalShielderActivityHistory } from 'src/domains/shielder/stores/getShielderIndexedDB';

/**
 * Custom hook to handle transaction details modal logic.
 * Fetches the latest transaction data and opens a modal with up-to-date information.
 * Handles modal ID transitions when transactions move from pending (localId only)
 * to confirmed state (both localId and txHash), preventing duplicate modals.
 */
const useActivityModal = () => {
  const { open } = useModal();

  const openTransactionModal = useCallback((tx: PartialLocalShielderActivityHistory) => {
    const modalId = tx.localId ?? tx.txHash;

    if(!modalId) {
      throw new Error('Transaction does not have a valid identifier');
    }

    const modalProps = tx.txHash ?
      { txHash: tx.txHash } :
      { localId: tx.localId };

    open(<ActivityDetailsModal {...modalProps} />, { idOverride: modalId });
  }, [open]);

  return {
    openTransactionModal,
  };
};

export default useActivityModal;
