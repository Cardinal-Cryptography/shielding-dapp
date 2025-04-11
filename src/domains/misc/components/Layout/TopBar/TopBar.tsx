import { useMediaQuery } from '@react-hookz/web';
import styled from 'styled-components';

import ChainIcon from 'src/domains/chains/components/ChainIcon';
import { useWallet } from 'src/domains/chains/components/WalletProvider';
import useChain from 'src/domains/chains/utils/useChain';
import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import { BOTTOM_MENU_BREAKPOINT, BREAKPOINTS } from 'src/domains/misc/consts/consts';
import formatAddress from 'src/domains/misc/utils/formatAddress';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import Navigation from '../Navigation';

import Brand from './Brand';
import * as NavBox from './NavBox';
import { BRAND_CONTAINER_TITLE, BRAND_LOGO_HEIGHT } from './consts';
import UserIcon from './userIcon.svg?react';

const TopBar = () => {
  const isSmallScreen = useMediaQuery(`(max-width: ${BOTTOM_MENU_BREAKPOINT})`);
  const isLargeScreen = useMediaQuery(`(min-width: ${BREAKPOINTS.sm})`);

  const chainConfig = useChain();
  const { openModal, disconnect, isConnected , address } = useWallet();

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
            <ChainSelector variant="secondary" onClick={() => void openModal({ view: 'Networks' })}>
              {chainConfig ? (
                <ButtonLeftContent>
                  <ChainIcon chainId={chainConfig.id} size={24} />
                  {isLargeScreen && chainConfig.name}
                </ButtonLeftContent>
              ) : 'Select Network'}
              <ChevronIcon icon="ChevronLeft" />
            </ChainSelector>
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
            variant="primary"
            onClick={() => void openModal({ view: 'Connect' })}
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

const ChainSelector = styled(Button)`
  display: flex;

  gap: ${vars('--spacing-s')};
  align-items: center;
  justify-content: space-between;

  padding-inline: ${vars('--spacing-s')};
  width: 246px;

  background: ${vars('--color-neutral-background-1-rest')};
  border-color: ${vars('--color-neutral-stroke-2-rest')};
  
  ${typography.web.body1};

  @media (width <= ${BOTTOM_MENU_BREAKPOINT}) { /* stylelint-disable-line media-query-no-invalid */
    width: fit-content;
  }
`;

const ButtonLeftContent = styled.div`
  display: flex;
  gap: ${vars('--spacing-s')};
  align-items: center;
`;

const ChevronIcon = styled(CIcon)`
  transform: rotate(180deg);
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
