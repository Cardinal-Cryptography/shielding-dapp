import styled from 'styled-components';

import { BOTTOM_MENU_BREAKPOINT } from 'src/domains/common/styles/tokens';
import { vars } from 'src/domains/common/styles/utils';

import Brand from './Brand';
import * as NavBox from './NavBox';
import { BRAND_CONTAINER_TITLE, BRAND_LOGO_HEIGHT } from './consts';

const TopBar = () => (
  <NavBox.Container>
    <NavBox.BrandCanvas>
      <BrandContainer>
        <StyledBrand />
      </BrandContainer>
    </NavBox.BrandCanvas>
  </NavBox.Container>
);

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
