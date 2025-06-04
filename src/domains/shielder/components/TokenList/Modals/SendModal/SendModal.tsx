import { ReactElement,useState } from 'react';
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

  const fees = useShielderFees({ walletAddress: address, token });

  const hasInsufficientFees = isPresent(token.balance) && fees?.fee_details.total_cost_fee_token ?
    token.balance < fees.fee_details.total_cost_fee_token :
    false;

  const fee = (
    fees?.fee_details.total_cost_fee_token ?
      { address: token.isNative ? 'native' as const : token.address, amount: fees.fee_details.total_cost_fee_token } :
      undefined
  );

  const feeConfig = [
    {
      label: 'Transaction fee',
      amount: fees?.fee_details.total_cost_fee_token,
      tokenSymbol: token.symbol,
      tokenDecimals: token.decimals,
      tokenIcon: token.icon,
      isError: hasInsufficientFees,
    },
    {
      label: 'Network fee',
      amount: fees?.fee_details.gas_cost_fee_token,
      tokenSymbol: token.symbol,
      tokenDecimals: token.decimals,
      tokenIcon: token.icon,
    },
    {
      label: 'Relayer fee',
      amount: fees?.fee_details.commission_fee_token,
      tokenSymbol: token.symbol,
      tokenDecimals: token.decimals,
      tokenIcon: token.icon,
    },
  ];

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
      fee,
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
                feeConfig={feeConfig}
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
                feeConfig={feeConfig}
                buttonLabel={
                  hasInsufficientFees ?
                    `Insufficient ${token.symbol} Balance` :
                    isWithdrawing ? 'Sending privately' : 'Confirm'
                }
              />
            ),
          },
        ]
      }
    />
  );
};

export default SendModal;
