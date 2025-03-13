import { Meta, StoryObj } from '@storybook/react';
import { ComponentProps } from 'react';
import styled from 'styled-components';

import ComponentsGrid, { HeaderCell } from '../../../../.storybook/utils/ComponentsGrid';

import Badge from './Badge';

const SIZES = ['large', 'medium'] as const;
const DESIGNS = ['filled', 'tint'] as const;
const VARIANTS = ['success', 'brand', 'informative', 'danger', 'warning', 'subtle', 'severe-warning'] as const;
const ICONSIDES = ['none', 'left','right', 'both'] as const;

const meta = {
  component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;

export const Configurable: StoryObj<ComponentProps<typeof Badge> &
  { iconSide: 'left' | 'right' | 'none' | 'both' }> = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: {
    text: 'Badge',
    variant: 'success',
    design: 'tint',
    circular: true,
    iconSide: 'left',
    size: 'large',
  },
  argTypes: {
    size: { control: 'select', options: SIZES },
    design: { control: 'select', options: DESIGNS },
    variant: { control: 'select', options: VARIANTS },
    circular: { control: 'boolean' },
    iconSide: { control: 'radio', options: ICONSIDES },
    leftIcon: { table: { disable: true }},
    rightIcon: { table: { disable: true }},
  },
  render: ({ iconSide, children, ...args }) => (
    <Badge
      {...args}
      leftIcon={['left','both'].includes(iconSide) ? 'Azero' : undefined}
      rightIcon={['right','both'].includes(iconSide) ? 'Azero' : undefined}
    >
      {children}
    </Badge>
  ),
};

export const Variants: StoryObj<{ text: string }> = {
  parameters: {
    controls: { exclude: /.*/g },
  },
  args: {
    text: 'Badge',
  },
  render: ({ text }) => (
    <GridContainer $columnsCount={DESIGNS.length + 1}>
      {
        [
          <HeaderCell key="empty header cell" />,
          DESIGNS.map(design => <HeaderCell key={design}>{design}</HeaderCell>),
          SIZES.flatMap(size =>
            [
              <HeaderCell key={size}>{size}</HeaderCell>,
              DESIGNS.map(design => (
                <FlexContainer $col key={size+design}>
                  {
                    VARIANTS.map(variant => (
                      <FlexContainer key={size+design+variant}>
                        <Badge
                          variant={variant}
                          size={size}
                          design={design}
                          leftIcon="Azero"
                          text={text}
                        />
                        <Badge
                          variant={variant}
                          size={size}
                          design={design}
                          rightIcon="Azero"
                          text={text}
                        />
                        <Badge
                          variant={variant}
                          size={size}
                          circular
                          design={design}
                          leftIcon="Azero"
                          text={text}
                        />
                        <Badge
                          variant={variant}
                          size={size}
                          circular
                          design={design}
                          rightIcon="Azero"
                          text={text}
                        />
                        <Badge
                          variant={variant}
                          size={size}
                          circular
                          design={design}
                          leftIcon="Azero"
                        />
                        <Badge
                          variant={variant}
                          size={size}
                          circular
                          design={design}
                          text={text}
                        />
                        <Badge
                          variant={variant}
                          size={size}
                          circular
                          design={design}
                          text={text.slice(0,1)}
                        />
                      </FlexContainer>
                    ))}
                </FlexContainer>
              )
              ),
            ]
          ),
        ]
      }
    </GridContainer>
  ),
};

const FlexContainer = styled.div<{ $col?: boolean }>`
  display: flex;
  gap: ${({ $col }) => $col ? '10px' : '20px'};
  justify-content: start;
  flex-direction: ${({ $col }) => $col ? 'column' : 'row'};
  width: 100%;
`;

const GridContainer = styled(ComponentsGrid)`
  grid-template-columns: repeat(${props => props.$columnsCount}, auto);

  column-gap: 20px;
  row-gap: 10px;
`;
