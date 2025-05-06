import type { ComponentProps } from 'react';

import Tabs from 'src/domains/misc/components/Tabs';
import router from 'src/domains/routing/utils/router';

const tabsConfig = [
  {
    key: 'shield',
    label: 'Shielded Account',
    routeNames: ['Shielded-Account'],
    onClick: () => void router.push('Shielded-Account'),
  },
  {
    key: 'yield',
    label: 'Shielded Yield',
    routeNames: ['Yield'],
    onClick: () => void router.push('Yield'),
    comingSoon: true,
  },
] as const;

type Props = {
  className?: string,
  position: ComponentProps<typeof Tabs>['position'],
};

const Navigation = (props: Props) => {
  const route = router.useRoute(['Shielded-Account']);

  const selectedTab = tabsConfig.find(tabConfig => tabConfig.routeNames.includes(route?.name as never));

  return <Tabs {...props} tabsConfig={tabsConfig} selectedTabKey={selectedTab?.key} />;
};

export default Navigation;
