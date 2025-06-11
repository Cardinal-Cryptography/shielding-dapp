import { Meta, StoryObj } from '@storybook/react';
import { m as motion } from 'framer-motion';
import styled from 'styled-components';

import Tooltip from './Tooltip';

const Centered = styled(motion.div)`
  text-align: center;
`;

const tooltipText = 'Some text in a tooltip.';

const meta = {
  component: Tooltip,
  args: {
    text: tooltipText,
    disabled: false,
    side: 'top',
    children: (
      <Centered drag data-chromatic="ignore">
        hover me
        {' '}
        <br />
        and drag me to an edge
      </Centered>
    ),
  },
  argTypes: {
    children: { table: { disable: true }},
  },
  decorators: [
    Story => (
      <StaticFrame>
        <Story />
      </StaticFrame>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    // can't make the tooltip show up in a story
    chromatic: { disableSnapshot: true },
  },
};

const StaticFrame = styled.div`
  display: flex;

  align-items: center;
  justify-content: center;

  width: min(100vw, 300px);
  height: min(100vh, 200px);
  margin: -20px;
`;
