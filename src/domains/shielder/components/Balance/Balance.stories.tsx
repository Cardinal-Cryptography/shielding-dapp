import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import styled from 'styled-components';

import Balance from './Balance';
import type { BalanceType } from './consts';

const meta = {
  component: Balance,
  parameters: {
    controls: {
      exclude: /.*/g,
    },
  },
  args: {
    publicBalance: 5678n * 10n ** 18n,
    privateBalance: 123n * 10n ** 18n,
    nativeAssetDecimals: 18,
    nativeAssetUsdPrice: 0.51,
    publicTokensUsdValue: 123.45,
  },
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
} satisfies Meta<typeof Balance>;

export default meta;

type Story = StoryObj<typeof Balance>;

export const Controllable: Story = {
  render: props => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selectedAccountType, setSelectedAccountType] = useState<BalanceType>('public');

    return (
      <Balance
        {...props}
        selectedAccountType={selectedAccountType}
        setSelectedAccountType={setSelectedAccountType}
      />
    );
  },
};

const Container = styled.div`
  width: 400px;
`;
