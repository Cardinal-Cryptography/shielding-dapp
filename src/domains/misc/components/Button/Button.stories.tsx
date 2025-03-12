import { Meta, StoryObj } from '@storybook/react';
import { ComponentProps } from 'react';

import ComponentsGrid, { HeaderCell } from '../../../../../.storybook/utils/ComponentsGrid';

import Button from './Button';

const SIZES = ['large', 'medium', 'small', 'extra-small', 'tiny'] as const;
const VARIANTS = ['primary', 'secondary', 'outline', 'subtle', 'transparent', 'danger', 'icon only'] as const;

const meta = {
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;

export const Configurable: StoryObj<ComponentProps<typeof Button> & {
  withLeftIcon: boolean,
  withRightIcon: boolean,
}> = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: {
    children: 'Click me!',
    size: 'medium',
    variant: 'primary',
    disabled: false,
    selected: false,
    withLeftIcon: false,
    withRightIcon: false,
  },
  argTypes: {
    size: { control: 'select', options: SIZES },
    variant: { control: 'select', options: VARIANTS },
    leftIcon: { table: { disable: true }},
    rightIcon: { table: { disable: true }},
    onClick: { action: 'clicked', table: { disable: true }},
    withLeftIcon: { name: 'With left icon', type: 'boolean' },
    withRightIcon: { name: 'With right icon', type: 'boolean' },
  },
  render: ({ withLeftIcon, withRightIcon, ...args }) => (
    <Button
      {...args}
      leftIcon={withLeftIcon ? 'Shielded' : undefined}
      rightIcon={withRightIcon ? 'Shielded' : undefined}
    />
  ),
};

export const Variants: StoryObj<Record<string, never>> = {
  render: () => (
    <ComponentsGrid $columnsCount={VARIANTS.length + 1 /* "+1" for the header column */}>
      {
        [
          <HeaderCell key="empty header cell" />,
          ...VARIANTS.map(variant => <HeaderCell key={variant}>{variant}</HeaderCell>),
          ...SIZES.flatMap(size =>
            [
              <HeaderCell key={size}>{size}</HeaderCell>,
              ...VARIANTS.map(variant =>
                variant === 'icon only' ? (
                  <Button
                    key={`${size}-${variant}`}
                    size={size}
                    variant="outline"
                    leftIcon="Shielded"
                  />
                ) : (
                  <Button
                    key={`${size}-${variant}`}
                    size={size}
                    variant={variant}
                    leftIcon="Shielded"
                  >
                    Click me!
                  </Button>
                )
              ),
            ]
          ),
          <HeaderCell key="selected">selected</HeaderCell>,
          ...VARIANTS.map(variant =>
            variant === 'icon only' ? (
              <Button
                key={`${variant}-selected`}
                size="medium"
                variant="outline"
                leftIcon="Shielded"
                selected
              />
            ) : (
              <Button
                key={`${variant}-selected`}
                size="medium"
                variant={variant}
                leftIcon="Shielded"
                selected
              >
                Click me!
              </Button>
            )
          ),
          <HeaderCell key="disabled">disabled</HeaderCell>,
          ...VARIANTS.map(variant =>
            variant === 'icon only' ? (
              <Button
                key={`${variant}-disabled`}
                size="medium"
                variant="outline"
                leftIcon="Shielded"
                disabled
              />
            ) : (
              <Button
                key={`${variant}-disabled`}
                size="medium"
                variant={variant}
                leftIcon="Shielded"
                disabled
              >
                Click me!
              </Button>
            )
          ),
        ]
      }
    </ComponentsGrid>
  ),
};
