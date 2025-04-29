import { Address } from 'viem';
import { create } from 'zustand';

type SelectedTransactionStore = {
  selectedTransactionTxHash: Address | null,
  openTransactionModal: (txHash: Address | null) => void,
  clearSelectedTransaction: () => void,
};

const useSelectedTransactionModal = create<SelectedTransactionStore>()(
  set => ({
    selectedTransactionTxHash: null,
    openTransactionModal: txHash => {
      set({ selectedTransactionTxHash: txHash });
    },
    clearSelectedTransaction: () => {
      set({ selectedTransactionTxHash: null });
    },
  }),
);

export default useSelectedTransactionModal;
