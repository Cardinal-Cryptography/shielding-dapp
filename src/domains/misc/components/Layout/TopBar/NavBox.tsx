import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';

import { BREAKPOINTS } from 'src/domains/misc/consts/consts';
import { backgroundFilters, transitionTime } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import skeletonStyles from './skeletonStyles';

type Props = {
  children: ReactNode,
  wrapperClassName?: string,
  contentContainerClassName?: string,
};

export const Container = ({ children, wrapperClassName, contentContainerClassName }: Props) => (
  <BorderWrapper className={wrapperClassName}>
    <ContentWrapper className={contentContainerClassName}>
      {children}
    </ContentWrapper>
  </BorderWrapper>
);

const borderSize = 1;

const BorderWrapper = styled.div.withConfig({
  shouldForwardProp: prop => !['withGradientBorder'].includes(prop),
})`
  min-width: 0;

  @media (width > ${BREAKPOINTS.lg}) { /* stylelint-disable-line media-query-no-invalid */
    position: relative;
    margin: ${vars('--spacing-xxxl')};
    padding: ${borderSize}px;
    
    &::after {
      content: "";

      position: absolute;
      inset: 0;

      border: ${borderSize}px solid ${vars('--color-neutral-stroke-3-rest')};

      border-radius: ${vars('--border-radius-xxl')};
      pointer-events: none; /* necessary because of the z-index, which makes this element cover other children */

      mask-image: linear-gradient(to bottom right, black 10%, transparent 90%);
    }
  }
`;

const ContentWrapper = styled.section`
  display: flex;

  justify-content: space-between;
  gap: ${vars('--spacing-xs')};

  width: 100%;
  padding-bottom: ${vars('--spacing-s')};

  background-color: ${vars('--color-neutral-background-alpha-3-rest')};
  ${backgroundFilters.backgroundBlur1}
  

  @media (width > ${BREAKPOINTS.lg}) { /* stylelint-disable-line media-query-no-invalid */
    gap: ${vars('--spacing-s')};
    padding: ${vars('--spacing-s')};
    border-radius: calc(${vars('--border-radius-xxl')} - ${borderSize}px);
  }
`;

const Canvas = styled.section`
  display: flex;

  align-items: center;

  height: 52px;
  padding: ${vars('--spacing-s')};
  border: 1px solid transparent;

  background-image:
          linear-gradient(${vars('--color-neutral-background-2-rest')}, ${vars('--color-neutral-background-2-rest')}),
          radial-gradient(100% 100% at 0% 0%, ${vars('--color-neutral-background-1-rest')}, transparent);

  background-origin: border-box;
  background-clip: padding-box, border-box;

  ${backgroundFilters.backgroundBlur1};
  
  @media (width > ${BREAKPOINTS.lg}) { /* stylelint-disable-line media-query-no-invalid */
    height: 56px;
    border-radius: ${vars('--border-radius-l')};
  }
`;

export const BrandCanvas = styled(Canvas)`
  flex-grow: 1;
  gap: ${vars('--spacing-xxxxl')};

  @media (width <= ${BREAKPOINTS.lg}) { /* stylelint-disable-line media-query-no-invalid */
    border-bottom-right-radius: ${vars('--spacing-l')};
  }
`;

export const UserCanvas = styled(Canvas)<{ $isConnected: boolean }>`
  justify-content: end;
  padding: 0;
  padding-inline: ${({ $isConnected }) => $isConnected ?
    vars('--spacing-m-nudge') : vars('--spacing-s')};
  border: 1px solid transparent;
  transition: all ${transitionTime};
  
  ${({ $isConnected }) => $isConnected && css`
    &:hover {
      border-bottom: 1px solid ${vars('--color-brand-stroke-compound-hover')};
      background: ${vars('--color-neutral-background-2-hover')};

      border-left: 1px solid ${vars('--color-brand-stroke-compound-hover')};
      
      @media (width >= 870px) {
        border: 1px solid ${vars('--color-brand-stroke-compound-hover')};
      }

      ${ChevronDown} {
        transform: translateY(${vars('--spacing-xxs')});
      }
    }

    &:active {
      border-bottom: 1px solid ${vars('--color-brand-stroke-compound-pressed')};
      background: ${vars('--color-neutral-background-2-pressed')};

      border-left: 1px solid ${vars('--color-brand-stroke-compound-pressed')};
      
      @media (width >= 870px) {
        border: 1px solid ${vars('--color-brand-stroke-compound-pressed')};
      }
    }
  `};

  @media (width <= ${BREAKPOINTS.lg}) { /* stylelint-disable-line media-query-no-invalid */
    border-bottom-left-radius: ${vars('--spacing-l')};
  }
  
  &:empty {
    border: ${vars('--spacing-s')} solid ${vars('--color-neutral-background-2-rest')};
    min-width: 112px;
    ${skeletonStyles}
  }
`;

// TODO: add icon
export const ChevronDown = styled.span`
  transition: all ${transitionTime};
`;
