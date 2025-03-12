import { AnimatePresence } from 'motion/react';
import { type ComponentProps, type ReactElement, useId } from 'react';
import styled from 'styled-components';

import { vars } from 'src/domains/common/styles/utils';
import composeFluidSize from 'src/domains/common/utils/composeFluidSize';

import Tab from './Tab';

type TabConfig = {
  key: string,
  label: string,
  disabled?: boolean,
  onClick: () => void,
  icon?: ReactElement,
};

type Props<TabsConfig extends readonly TabConfig[]> = {
  tabsConfig: TabsConfig,
  selectedTabKey?: TabsConfig[number]['key'],
  className?: string,
  size?: 'small' | 'medium',
  position?: ComponentProps<typeof Tab>['position'],
};

const Tabs = <TabsConfig extends readonly TabConfig[]>(
  { tabsConfig, selectedTabKey, className, size, position }: Props<TabsConfig>
) => {
  const selectionBarLayoutId = `tabs-selection-bar-${useId()}`;

  return (
    <Container className={className}>
      <AnimatePresence>
        {tabsConfig.map(({ key, label, disabled, onClick, icon }) => (
          <Tab
            key={key}
            label={label}
            selected={selectedTabKey === key}
            disabled={disabled}
            onClick={onClick}
            layoutId={selectionBarLayoutId}
            size={size}
            icon={icon}
            position={position}
          />
        ))}
      </AnimatePresence>
    </Container>
  );
};

export default Tabs;

const Container = styled.nav`
  display: flex;
  gap: ${
    composeFluidSize(
      { sizeToken: vars('--spacing-none'), atBreakpoint: 360 },
      { sizeToken: vars('--spacing-s'), atBreakpoint: 640 },
      'vw'
    )
  };
`;
