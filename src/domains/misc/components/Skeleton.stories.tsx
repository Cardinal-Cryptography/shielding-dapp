import type { Meta, StoryObj } from '@storybook/react';
import { ComponentProps } from 'react';

import Skeleton from 'src/domains/misc/components/Skeleton';

type Props = ComponentProps<typeof Skeleton> & { height?: number, width?: number };

const meta: Meta<Props> = {
  component: Skeleton,
};

export default meta;

type Story = StoryObj<Props>;

export const Variants: Story = {
  argTypes: { children: { type: 'string' }, height: { control: 'range' }, width: { control: { type: 'range', max: 300 }}},
  args: {
    children: 'Hi there!',
    height: 20,
    width: undefined,
    loading: true,
    noAnimation: false,
  },
  render: args => (
    <Skeleton style={{ height: args.height, width: args.width ?? 7 * (args.children as string).length }} {...args} />
  ),
};
