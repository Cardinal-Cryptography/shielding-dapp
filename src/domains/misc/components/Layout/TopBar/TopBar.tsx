import { useMediaQuery } from '@react-hookz/web';
import styled from 'styled-components';

import { useNetworkStore } from 'src/domains/chains/stores/network';
import Tabs from 'src/domains/misc/components/Tabs';
import { BOTTOM_MENU_BREAKPOINT } from 'src/domains/misc/consts/consts';
import vars from 'src/domains/styling/utils/vars';

import Navigation from '../Navigation';

import Brand from './Brand';
import * as NavBox from './NavBox';
import { BRAND_CONTAINER_TITLE, BRAND_LOGO_HEIGHT } from './consts';

const TopBar = () => {
  const isSmallScreen = useMediaQuery(`(max-width: ${BOTTOM_MENU_BREAKPOINT})`);
  const { network, setNetwork } = useNetworkStore();

  return (
    <NavBox.Container>
      <NavBox.BrandCanvas>
        <BrandContainer>
          <StyledBrand />
        </BrandContainer>
        {!isSmallScreen && <Navigation position="floor" />}
      </NavBox.BrandCanvas>
      <NavBox.UserCanvas $isConnected={false}>
        {!isSmallScreen && (
          <Tabs
            tabsConfig={[
              { label: 'Mainnet', key: 'mainnet', onClick: () => void setNetwork('mainnet') },
              { label: 'Testnet', key: 'testnet', onClick: () => void setNetwork('testnet') },
            ]}
            selectedTabKey={network}
          />
        )}
      </NavBox.UserCanvas>
    </NavBox.Container>
  );
};

export default TopBar;

const StyledBrand = styled(Brand)`
  margin-left: 8px;
  height: ${BRAND_LOGO_HEIGHT};
`;

const BrandContainer = styled.div`
  @media (width <= ${BOTTOM_MENU_BREAKPOINT}) { /* stylelint-disable-line media-query-no-invalid */
    flex: 1;
    margin-right: ${vars('--spacing-s')};

    container: ${BRAND_CONTAINER_TITLE} / inline-size;
  }
`;
