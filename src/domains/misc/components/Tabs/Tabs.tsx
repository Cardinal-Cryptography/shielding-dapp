import { AnimatePresence } from 'motion/react';
import { ComponentProps, ReactElement, useId } from 'react';
import styled from 'styled-components';

import composeFluidSize from 'src/domains/styling/utils/composeFluidSize';

import Tab from './Tab';

type TabConfig = {
  key: string,
  label: string,
  onClick: () => void,
  icon?: ReactElement,
  comingSoon?: boolean,
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
        {tabsConfig.map(({ key, label, onClick, icon, comingSoon }) => (
          <Tab
            key={key}
            label={label}
            selected={selectedTabKey === key}
            comingSoon={comingSoon}
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
      { sizeToken: '--spacing-none', atBreakpoint: 360 },
      { sizeToken: '--spacing-s', atBreakpoint: 640 },
      'vw'
    )
  };
`;
