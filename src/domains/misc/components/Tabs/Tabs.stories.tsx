import type { Meta, StoryObj } from '@storybook/react';
import { type ComponentProps, useState } from 'react';

import Tabs from './Tabs';

const meta = {
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;

const TabsWithSelector = (
  { tabsLabelsString, disabledTabsIndices }: { tabsLabelsString: string, disabledTabsIndices: string }
) => {
  const tabsLabels = tabsLabelsString.split(',');
  const disabledIndices = disabledTabsIndices.split(',').filter(Boolean).map(Number);
  const [selectedItemLabel, setSelectedItemLabel] = useState(`${tabsLabels[0]}-0`);
  const tabsConfig = tabsLabels.map((label, i) => {
    const key = `${label}-${i}`;

    return {
      key,
      label,
      disabled: disabledIndices.includes(i),
      onClick: () => void setSelectedItemLabel(key),
    };
  });

  return <Tabs tabsConfig={tabsConfig} selectedTabKey={selectedItemLabel} />;
};

export const Basic: StoryObj<ComponentProps<typeof Tabs> & {
  tabsLabelsString: string,
  disabledTabsIndices: string,
}> = {
  args: {
    tabsLabelsString: 'First,A Very Long One,Third,Fourth',
    disabledTabsIndices: '2',
  },
  argTypes: {
    tabsLabelsString: {
      name: 'A comma-separated list of tabs labels',
    },
    disabledTabsIndices: {
      name: 'A comma-separated list of indices of the disabled tabs',
    },
    tabsConfig: { table: { disable: true }},
    selectedTabKey: { table: { disable: true }},
    className: { table: { disable: true }},
  },
  render: TabsWithSelector,
};
