import { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';
import { objectEntries } from 'tsafe';

import getChainConfigById from 'src/domains/chains/utils/getChainConfigById';
import TokenList from 'src/domains/shielder/components/TokenList';

const StyledTokenList = styled(TokenList)`
  max-height: 200px;
`;

const chainConfig = getChainConfigById(2039);

const nonNativeTokens =
  objectEntries(chainConfig.whitelistedTokens).map(([address, token]) => ({
    ...token,
    address,
    isNative: false as const,
    chain: chainConfig.chain,
    name: 'Unknown',
    symbol: 'N/A',
    decimals: 18,
    usdPrice: 0,
  }));

const nativeToken =
  [
    {
      address: undefined,
      isNative: true as const,
      chain: chainConfig.chain,
      name: chainConfig.nativeCurrency.name,
      symbol: chainConfig.nativeCurrency.symbol,
      decimals: chainConfig.nativeCurrency.decimals,
      icon: chainConfig.NativeTokenIcon,
    },
  ];

const tokens = [...nativeToken, ...nonNativeTokens];

const meta = {
  component: StyledTokenList,
  args: {
    onTokenClick: token => void alert(token.name),
    tokens,
  },

} satisfies Meta<typeof TokenList>;

export default meta;

type Story = StoryObj<typeof TokenList>;

export const Default: Story = {};
