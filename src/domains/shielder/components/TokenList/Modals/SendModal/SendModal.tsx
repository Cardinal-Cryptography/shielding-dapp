import { ReactElement,useState } from 'react';
import styled from 'styled-components';
import { Address } from 'viem';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import Modal from 'src/domains/misc/components/Modal';
import vars from 'src/domains/styling/utils/vars';

import { Token } from '../../';

import SelectAccountPage from './SelectAccountPage';
import SendPage from './SendPage';

type Props = {
  children?: ReactElement,
  token: Token & {
    symbol?: string,
    decimals?: number,
    balance?: bigint,
  },
};

const SendModal = ({ children, token }: Props) => {
  const { address } = useWallet();
  const [addressTo, setAddressTo] = useState<string>(address ?? '');
  const [page, setPage] = useState(0);

  const onConfirm = () => {
    setPage(1);
  };

  return (
    <StyledModal
      currentPageIndex={page}
      title={['Send', 'Send']}
      triggerElement={children}
      onPreviousPageClick={() => void setPage(0)}
    >
      {
        [
          <SelectAccountPage key="select-account" addressTo={addressTo} setAddressTo={setAddressTo} onConfirmClick={onConfirm} />,
          close => <SendPage key="send-tokens" token={token} addressTo={addressTo as Address} onSuccess={close} />,
        ]
      }
    </StyledModal>
  );
};

export default SendModal;

const StyledModal = styled(Modal)`
  padding: ${vars('--spacing-l')};
  width: min(434px, 100vw);
`;
