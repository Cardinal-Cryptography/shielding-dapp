import { useMediaQuery } from '@react-hookz/web';
import styled from 'styled-components';

import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain.ts';
import Button from 'src/domains/misc/components/Button';
import { BOTTOM_MENU_BREAKPOINT } from 'src/domains/misc/consts/consts';
import vars from 'src/domains/styling/utils/vars';

import Navigation from '../Navigation';

import Brand from './Brand';
import * as NavBox from './NavBox';
import { BRAND_CONTAINER_TITLE, BRAND_LOGO_HEIGHT } from './consts';

const TopBar = () => {
  const isSmallScreen = useMediaQuery(`(max-width: ${BOTTOM_MENU_BREAKPOINT})`);
  const chainConfig = useChain();
  const { openModal, disconnect, isConnected } = useWallet();

  return (
    <NavBox.Container>
      <NavBox.BrandCanvas>
        <BrandContainer>
          <StyledBrand />
        </BrandContainer>
        {!isSmallScreen && <Navigation position="floor" />}
      </NavBox.BrandCanvas>
      <NavBox.UserCanvas $isConnected={false}>
        {isConnected ? (chainConfig && (
          <>
            <ChainButton variant="primary" onClick={() => void openModal({ view: 'Networks' })}>
              <Icon>
                <chainConfig.ChainIcon />
              </Icon>
              {chainConfig.name}
            </ChainButton>
            <Button variant="transparent"
              leftIcon="Power"
              onClick={() => void disconnect()}
            >
            </Button>
          </>
        )) :
        <Button variant="primary" onClick={() => void openModal({ view: 'Connect' })}>Connect</Button>}
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

const ChainButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-s')};
`;

const Icon = styled.div`
  height: 24px;
  width: 24px;

  & svg {
    height: 100%;
    width: 100%;
    
    * {
      fill: currentcolor;
      stroke: currentcolor;
    }
  }
`;
