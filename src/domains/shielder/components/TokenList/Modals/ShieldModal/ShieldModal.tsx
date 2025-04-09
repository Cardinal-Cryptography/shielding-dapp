import { ReactElement,useState } from 'react';
import styled from 'styled-components';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import Modal from 'src/domains/misc/components/Modal';
import useShield from 'src/domains/shielder/utils/useShield';
import useShielderFees from 'src/domains/shielder/utils/useShielderFees';
import vars from 'src/domains/styling/utils/vars';

import { Token } from '../../';
import ConfirmPage from '../ConfirmPage';

import SelectAmountPage from './SelectAmountPage';

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
  const [page, setPage] = useState(0);
  const [amount, setAmount] = useState(0n);
  const chainConfig = useChain();
  const { shield, isShielding, reset } = useShield();

  const fees = useShielderFees({ walletAddress: address, token });

  const feeConfig = [
    {
      label: 'Transaction fee',
      amount: fees?.fee_details.total_cost_native,
      tokenSymbol: chainConfig?.nativeCurrency.symbol,
      tokenDecimals: chainConfig?.nativeCurrency.decimals,
      tokenIcon: chainConfig?.NativeTokenIcon,
    },
  ];

  const handleSelectAmount = (amount: bigint) => {
    setAmount(amount);
    setPage(1);
  };

  const handleShield = (close: () => Promise<unknown>) => {
    void shield({ token, amount }).then(() => void close());
  };

  const handleReset = () => {
    setPage(0);
    reset();
  };

  return (
    <StyledModal
      currentPageIndex={page}
      title={['Shield', 'Shield']}
      triggerElement={children}
      onClose={handleReset}
    >
      {
        [
          <SelectAmountPage key="select-amount" token={token} feeConfig={feeConfig} onContinue={handleSelectAmount} />,
          close => (
            <ConfirmPage
              key="confirmation"
              amount={amount}
              token={token}
              onConfirm={() => void handleShield(close)}
              loadingText={isShielding ? 'Shielding' : undefined}
              feeConfig={feeConfig}
              addressFrom={address}
            />
          ),
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
