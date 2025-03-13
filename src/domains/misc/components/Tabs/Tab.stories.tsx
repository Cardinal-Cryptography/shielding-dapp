import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import Tab from './Tab';

const meta = {
  component: Tab,
} satisfies Meta<typeof Tab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    chromatic: { disableSnapshot: true }, // this component is tested enough within the <Tabs> story
  },
  args: {
    label: 'Swap',
    selected: false,
    layoutId: 'layout-id',
    comingSoon: false,
    onClick: fn(),
  },
  argTypes: {
    onClick: {
      action: 'clicked',
      table: { disable: true },
    },
    layoutId: { table: { disable: true }},
  },
};
