import { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';

import TokenList from 'src/domains/shielder/components/TokenList';

const StyledTokenList = styled(TokenList)`
  max-height: 200px;
`;

const meta = {
  title: 'TokenList',
  component: StyledTokenList,
  args: {
    onTokenClick: token => void alert(token.name),
    tokens: [
      {
        address: '0x1',
        name: 'Ethereum',
        chain: 'alephEvm',
        icon: 'Eth',
        decimals: 18,
        balance: {
          atomic: '1500000000000000000',
          usd: 4500,
        },
        usdPrice: 3000,
        symbol: 'ETH',
      },
      {
        address: '0x2',
        name: 'Aleph Zero',
        icon: 'Azero',
        chain: 'alephEvm',
        decimals: 8,
        balance: {
          atomic: '50000000000',
          usd: 75,
        },
        usdPrice: 0.15,
        symbol: 'AZERO',
      },
      {
        address: '0x3',
        name: 'Bitcoin',
        icon: 'WBtc',
        chain: 'alephEvm',
        decimals: 8,
        balance: {
          atomic: '25000000',
          usd: 12500,
        },
        usdPrice: 50000,
        symbol: 'BTC',
      },
      {
        address: '0x4',
        name: 'Tether',
        icon: 'Usdt',
        chain: 'alephEvm',
        decimals: 6,
        balance: {
          atomic: '1000000000',
          usd: 1000,
        },
        usdPrice: 1,
        symbol: 'USDT',
      },
      {
        address: '0x5',
        name: 'USD Coin',
        icon: 'Usdc',
        chain: 'alephEvm',
        decimals: 6,
        balance: {
          atomic: '500000000',
          usd: 500,
        },
        usdPrice: 1,
        symbol: 'USDC',
      },
    ],
  },

} satisfies Meta<typeof TokenList>;

export default meta;

type Story = StoryObj<typeof TokenList>;

export const Default: Story = {};
