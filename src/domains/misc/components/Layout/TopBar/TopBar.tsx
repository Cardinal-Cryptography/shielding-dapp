import { useMediaQuery } from '@react-hookz/web';
import styled from 'styled-components';

import ChainSelector from 'src/domains/chains/components/ChainSelector';
import ConnectModal from 'src/domains/chains/components/ConnectModal.tsx';
import { useWallet } from 'src/domains/chains/components/WalletProvider';
import Button from 'src/domains/misc/components/Button';
import { BOTTOM_MENU_BREAKPOINT } from 'src/domains/misc/consts/consts';
import formatAddress from 'src/domains/misc/utils/formatAddress';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import { useModal } from '../../Modal';
import Navigation from '../Navigation';

import Brand from './Brand';
import * as NavBox from './NavBox';
import { BRAND_CONTAINER_TITLE, BRAND_LOGO_HEIGHT } from './consts';
import UserIcon from './userIcon.svg?react';

const TopBar = () => {
  const isSmallScreen = useMediaQuery(`(max-width: ${BOTTOM_MENU_BREAKPOINT})`);
  const { disconnect, isConnected , address } = useWallet();
  const { open } = useModal();

  return (
    <NavBox.Container>
      <NavBox.BrandCanvas>
        <BrandContainer>
          <StyledBrand />
        </BrandContainer>
        {!isSmallScreen && <Navigation position="floor" />}
      </NavBox.BrandCanvas>
      <NavBox.UserCanvas>
        {isConnected ? (
          <AccountManager>
            <ChainSelector />
            <AccountDetails>
              <AccountIcon />
              {address && formatAddress(address)}
              <Button
                variant="transparent"
                leftIcon="Power"
                size="small"
                onClick={() => void disconnect()}
              >
              </Button>
            </AccountDetails>
          </AccountManager>
        ) : (
          <Button
            onClick={() => void open(<ConnectModal />)}
            variant="primary"
          >
            Connect
          </Button>
        )}
      </NavBox.UserCanvas>
    </NavBox.Container>
  );
};

export default TopBar;

const StyledBrand = styled(Brand)`
  margin-left: 8px;
  height: ${BRAND_LOGO_HEIGHT};

  flex-shrink: 0;
`;

const BrandContainer = styled.div`
  @media (width <= ${BOTTOM_MENU_BREAKPOINT}) { /* stylelint-disable-line media-query-no-invalid */
    flex: 1;
    margin-right: ${vars('--spacing-s')};

    container: ${BRAND_CONTAINER_TITLE} / inline-size;
  }
`;

const AccountDetails = styled.div`
  display: flex;
  align-items: center;
  ${typography.web.caption1};
`;

const AccountManager = styled.div`
  display:flex;
  gap: ${vars('--spacing-m')};
  align-items: center;
`;

const AccountIcon = styled(UserIcon)`
  margin-right: ${vars('--spacing-s')};
`;
