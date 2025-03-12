import styled from 'styled-components';

import vars from 'src/domains/styling/utils/vars';

import { BRAND_CONTAINER_TITLE, BRAND_LOGO_WIDTH_DESKTOP } from './consts';
import LogoSvg from './logo.svg?react';
import LogoTypeSvg from './logoType.svg?react';

type Props = {
  className?: string,
};

const Brand = ({ className }: Props) => (
  <Container>
    <MobileLogo className={className} />
    <DesktopLogo className={className} />
  </Container>
);

export default styled(Brand)`
  & * {
    fill: ${vars('--color-neutral-foreground-1-rest')};
  }
`;

const Container = styled.div`
  display: flex;
  align-self: stretch;
  align-items: center;
`;

const MobileLogo = styled(LogoSvg)`
  display: none;
    
  @container ${BRAND_CONTAINER_TITLE} (max-width: ${BRAND_LOGO_WIDTH_DESKTOP}) { /* stylelint-disable-line at-rule-prelude-no-invalid */
    display: block;
  }
`;

const DesktopLogo = styled(LogoTypeSvg)`
  @container ${BRAND_CONTAINER_TITLE} (max-width: ${BRAND_LOGO_WIDTH_DESKTOP}) { /* stylelint-disable-line at-rule-prelude-no-invalid */
    display: none;
  }
`;
