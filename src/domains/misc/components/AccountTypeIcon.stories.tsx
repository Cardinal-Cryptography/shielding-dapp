import type { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';

import AccountTypeIcon from './AccountTypeIcon';

const ACCOUNT_TYPES = ['public', 'shielded'] as const;
const SIZES = ['extra-small', 'small', 'medium', 'large'] as const;

const meta: Meta<typeof AccountTypeIcon> = {
  component: AccountTypeIcon,
  argTypes: {
    type: {
      table: {
        disable: true,
      },
    },
    size: {
      table: {
        disable: true,
      },
    },
    className: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof AccountTypeIcon>;

export const Variants: Story = {
  render: () => (
    <Grid>
      {ACCOUNT_TYPES.map(type => SIZES.map(size => (
        <AccountTypeIcon
          key={type + size}
          type={type}
          size={size}
        />
      )))}
    </Grid>
  ),
};

const Grid = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px
`;
