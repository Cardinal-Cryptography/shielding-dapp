import { useCallback } from 'react';
import { Address } from 'viem';

import TransactionDetailsModal from 'src/domains/shielder/components/TransactionDetailsModal';

import { useModal } from '../../misc/components/Modal';

import { useTransactionsHistory } from './useTransactionsHistory';

type TransactionIdentifier = {
  txHash: Address,
} | {
  localId: string,
};

/**
 * Custom hook to handle transaction details modal logic.
 * Prevents duplicate modals by using consistent modal IDs and handles
 * the transition from localId to txHash when transactions are confirmed.
 */
export const useTransactionDetailsModal = () => {
  const { open } = useModal();
  const { data: transactions } = useTransactionsHistory();

  const openTransactionModal = useCallback((identifier: TransactionIdentifier) => {
    // Find the transaction to determine the best modal ID
    const transaction = transactions?.find(tx => {
      if ('txHash' in identifier && tx.txHash === identifier.txHash) return true;
      if ('localId' in identifier && tx.localId === identifier.localId) return true;
      return false;
    });

    // Determine the modal ID priority: txHash > localId
    // This ensures we don't create duplicate modals when a transaction
    // transitions from pending (localId only) to confirmed (has txHash)
    const modalId = transaction?.txHash ?? ('localId' in identifier ? identifier.localId : identifier.txHash);

    // Determine the props to pass to the modal
    const modalProps: TransactionIdentifier = transaction?.txHash ?
      { txHash: transaction.txHash } :
      identifier;

    open(
      <TransactionDetailsModal {...modalProps} />,
      { idOverride: modalId }
    );
  }, [open, transactions]);

  return {
    openTransactionModal,
  };
};

export default useTransactionDetailsModal;
