import { ReactElement,useState } from 'react';
import styled from 'styled-components';
import { isAddress } from 'viem';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain.ts';
import Modal from 'src/domains/misc/components/Modal';
import useShielderFees from 'src/domains/shielder/utils/useShielderFees';
import useWithdraw from 'src/domains/shielder/utils/useWithdraw';
import vars from 'src/domains/styling/utils/vars';

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

const SendModal = ({ children, token }: Props) => {
  const { address } = useWallet();
  const [addressTo, setAddressTo] = useState('');
  const [page, setPage] = useState(0);
  const [amount, setAmount] = useState(0n);
  const chainConfig = useChain();
  const { withdraw, isWithdrawing } = useWithdraw();

  const onConfirm = () => {
    setPage(1);
  };

  const fees = useShielderFees({ walletAddress: address, token });

  const feeConfig = [
    {
      label: 'Transaction fee',
      amount: fees?.fee_details.total_cost_fee_token,
      tokenSymbol: token.symbol,
      tokenDecimals: token.decimals,
      tokenIcon: token.icon,
    },
    {
      label: 'Network fee',
      amount: fees?.fee_details.relayer_cost_native,
      tokenSymbol: chainConfig?.nativeCurrency.symbol,
      tokenDecimals: chainConfig?.nativeCurrency.decimals,
      tokenIcon: chainConfig?.NativeTokenIcon,
    },
    {
      label: 'Relayer fee',
      amount: fees?.fee_details.commission_native,
      tokenSymbol: chainConfig?.nativeCurrency.symbol,
      tokenDecimals: chainConfig?.nativeCurrency.decimals,
      tokenIcon: chainConfig?.NativeTokenIcon,
    },
  ];

  const handleSelectAmount = (amount: bigint) => {
    setAmount(amount);
    setPage(2);
  };

  const validatedAddressTo = isAddress(addressTo) ? addressTo : undefined;

  const handleWithdraw = (close: () => Promise<unknown>) => {
    if(!validatedAddressTo) {
      throw new Error('Address to is not available'); // should never happen
    }

    void withdraw({ token, amount, addressTo: validatedAddressTo }).then(() => close());
  };

  return (
    <StyledModal
      currentPageIndex={page}
      title={['Send', 'Send', 'Send']}
      triggerElement={children}
      onClose={() => void setPage(0)}
    >
      {
        [
          <SelectAccountPage key="select-account" addressTo={addressTo} setAddressTo={setAddressTo} onConfirmClick={onConfirm} />,
          <SelectAmountPage key="select-amount" token={token} feeConfig={feeConfig} onContinue={handleSelectAmount} />,
          close => (
            <ConfirmPage
              key="confirmation"
              amount={amount}
              token={token}
              addressTo={validatedAddressTo}
              onConfirm={() => void handleWithdraw(close)}
              loadingText={isWithdrawing ? 'Sending' : undefined}
              feeConfig={feeConfig}
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
