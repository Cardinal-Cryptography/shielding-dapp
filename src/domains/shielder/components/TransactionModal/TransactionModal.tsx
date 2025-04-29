import { useEffect, useState } from 'react';
import styled from 'styled-components';

import Modal from 'src/domains/misc/components/Modal';
import useSelectedTransactionModal from 'src/domains/shielder/stores/selectedTransaction';
import useTransactionsHistory from 'src/domains/shielder/utils/useTransactionsHistory';

import RecordPreview from './RecordPreview';

const TransactionsModal = () => {
  const { data: transactions } = useTransactionsHistory();
  const { selectedTransactionTxHash, clearSelectedTransaction } = useSelectedTransactionModal();
  const [open, setOpen] = useState(!!selectedTransactionTxHash);

  const selectedTransaction = transactions?.find(({ txHash }) => txHash === selectedTransactionTxHash);

  useEffect(() => {
    if(selectedTransaction) {
      setOpen(true);
    }
  }, [selectedTransaction]);

  return (
    <StyledModal
      side="right"
      title={selectedTransaction?.type === 'Deposit' ? 'Shielded' : 'Sent privately'}
      isModalOpen={open}
      onInitiateClosing={() => void setOpen(false)}
      onClose={() => void clearSelectedTransaction()}
    >
      {selectedTransaction ? <RecordPreview selectedTransaction={selectedTransaction} /> : <></>}
    </StyledModal>
  );
};

export default TransactionsModal;

const StyledModal = styled(Modal)`
  @media (width >= 434px) {
    width: 434px;
  }
`;
