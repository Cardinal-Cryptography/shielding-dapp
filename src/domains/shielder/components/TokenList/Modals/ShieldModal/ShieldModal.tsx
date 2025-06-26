import { useState } from 'react';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import usePublicBalance from 'src/domains/chains/utils/usePublicBalance';
import Modal, { useModalControls } from 'src/domains/misc/components/Modal';
import isPresent from 'src/domains/misc/utils/isPresent';
import useShield from 'src/domains/shielder/utils/useShield';
import useShielderFees from 'src/domains/shielder/utils/useShielderFees';

import { Token } from '../../';
import ConfirmPage from '../ConfirmPage';

import SelectAmountPage from './SelectAmountPage';

type Props = {
  token: Token & {
    symbol?: string,
    decimals?: number,
    balance?: bigint,
  },
};

const ShieldModal = ({ token }: Props) => {
  const { address } = useWallet();
  const { close } = useModalControls();
  const [amount, setAmount] = useState(0n);
  const chainConfig = useChain();
  const { shield, isShielding, reset } = useShield();
  const [page, setPage] = useState(0);

  const { totalFee } = useShielderFees({
    token,
    operation: 'shield',
    amount,
  });

  const { data: publicNativeBalance } = usePublicBalance({ accountAddress: address, token: { isNative: true }});

  const hasInsufficientFees = isPresent(publicNativeBalance) && totalFee ?
    publicNativeBalance < totalFee :
    false;

  const handleSelectAmount = (amount: bigint) => {
    setAmount(amount);
    setPage(1);
  };

  const handleShield = () => {
    void shield({
      token,
      amount,
    });
    void close();
  };

  const handleReset = () => {
    setPage(0);
    reset();
  };

  return (
    <Modal
      page={page}
      onClose={handleReset}
      config={
        [
          {
            title: 'Shield',
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
            title: 'Shield',
            content: (
              <ConfirmPage
                key="confirmation"
                amount={amount}
                token={token}
                onConfirm={() => void handleShield()}
                isLoading={isShielding}
                buttonLabel={
                  hasInsufficientFees ?
                    `Insufficient ${chainConfig?.nativeCurrency.symbol} Balance` :
                    isShielding ? 'Shielding' : 'Confirm'
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

export default ShieldModal;
