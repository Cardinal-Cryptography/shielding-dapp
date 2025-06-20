import { ReactElement, useState } from 'react';
import { isAddress } from 'viem';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import Modal, { useModalControls } from 'src/domains/misc/components/Modal';
import isPresent from 'src/domains/misc/utils/isPresent';
import useShielderFees from 'src/domains/shielder/utils/useShielderFees';
import useWithdraw from 'src/domains/shielder/utils/useWithdraw';

import { Token } from '../../';
import ConfirmPage from '../ConfirmPage';

import SelectAccountPage from './SelectAccountPage';
import SelectAmountPage from './SelectAmountPage';

type Props = {
  children?: ReactElement,
  token: Token & {
    symbol?: string,
    decimals?: number,
    balance?: bigint,
  },
};

const SendModal = ({ token }: Props) => {
  const { address } = useWallet();
  const [addressTo, setAddressTo] = useState('');
  const [amount, setAmount] = useState(0n);
  const { withdraw, isWithdrawing } = useWithdraw();
  const [page, setPage] = useState(0);
  const { close } = useModalControls();

  const onConfirm = () => {
    setPage(1);
  };

  const { totalFee } = useShielderFees({ token, operation: 'send' });

  const hasInsufficientFees = isPresent(token.balance) && totalFee ?
    token.balance < totalFee :
    false;

  const handleSelectAmount = (amount: bigint) => {
    setAmount(amount);
    setPage(2);
  };

  const validatedAddressTo = isAddress(addressTo) ? addressTo : undefined;

  const handleWithdraw = () => {
    if(!validatedAddressTo) {
      throw new Error('Address to is not available'); // should never happen
    }

    void withdraw({
      token,
      amount,
      addressTo: validatedAddressTo,
    });
    void close();
  };

  return (
    <Modal
      page={page}
      config={
        [
          {
            title: 'Send',
            content: (
              <SelectAccountPage
                key="select-account"
                addressTo={addressTo}
                setAddressTo={setAddressTo}
                onConfirmClick={onConfirm}
              />
            ),
          },
          {
            title: 'Send',
            content: (
              <SelectAmountPage
                key="select-amount"
                token={token}
                onContinue={handleSelectAmount}
                hasInsufficientFees={hasInsufficientFees}
              />
            ),
          },
          {
            title: 'Send',
            content: (
              <ConfirmPage
                key="confirmation"
                amount={amount}
                token={token}
                addressTo={validatedAddressTo}
                onConfirm={handleWithdraw}
                isLoading={isWithdrawing}
                buttonLabel={
                  hasInsufficientFees ?
                    `Insufficient ${token.symbol} Balance` :
                    isWithdrawing ? 'Sending privately' : 'Confirm'
                }
                addressFrom={address}
                hasInsufficientFees={hasInsufficientFees}
              />
            ),
          },
        ]
      }
    />
  );
};

export default SendModal;
