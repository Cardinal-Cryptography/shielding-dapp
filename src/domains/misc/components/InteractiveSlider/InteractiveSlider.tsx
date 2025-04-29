import { motion, useMotionValueEvent, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';

import * as ProgressBar from 'src/domains/misc/components/ProgressBar';
import useHasHoverCapability from 'src/domains/misc/utils/useHasHoverCapability';
import useHasTouchCapability from 'src/domains/misc/utils/useHasTouchCapability';
import useLiveBoundingClientRect from 'src/domains/misc/utils/useLiveBoundingClientRect';
import { transitionTime } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import Axis from './Axis';
import Thumb from './Thumb';
import { FORE_GROUND_TRACK_COLOR_VAR } from './consts';
import { SnapPoint, SnapRange } from './types';
import mergeEventListeners from './utils/mergeEventListeners';
import useHoverThumbInteractions from './utils/useHoverThumbInteractions';
import useOnSnap from './utils/useOnSnap';
import useOvershootLimitedSpringMotion from './utils/useOvershootLimitedSpringMotion';
import useSliderUsageTrackingListeners from './utils/useSliderUsageTrackingListeners';
import useThumbsMotions from './utils/useThumbsMotions';

type Props = {
  snapPoints: SnapPoint[],
  snapRange: SnapRange,
  /**
   * @param value In the [0, 1] range.
   */
  onValueChange: (value: number) => unknown,
  /**
   * If changed, the slider updates its position to match the value.
   * The value provided to the listener has to be in the [0, 1] range.
   */
  value: number,
  /**
   * Whether the axis doesn't play part in layout / doesn't shift the content below it.
   */
  isAxisHovering?: boolean,
  isAxisAlwaysVisible?: boolean,
  highlighted?: boolean,
  className?: string,
};

const InteractiveSlider = ({
  snapRange,
  snapPoints,
  onValueChange,
  value,
  isAxisHovering,
  isAxisAlwaysVisible,
  highlighted,
  className,
}: Props) => {
  // this is used to prevent loops of updates upon a change in the touch motion value caused by a change of the value coming from the parent component
  const [isUsingSliderRef, sliderUsageTrackingListeners] = useSliderUsageTrackingListeners();

  const hasTouchCapability = useHasTouchCapability();
  const hasHoverCapability = useHasHoverCapability();

  const [interactiveAreaRef, interactiveAreaRect, update] = useLiveBoundingClientRect();
  const interactiveAreaWidth = interactiveAreaRect ? interactiveAreaRect.right - interactiveAreaRect.left : undefined;

  const {
    interactiveAreaEventsListeners: dragEventsListeners,
    touchMotion,
    hoverMotion,
    snapPointsPositions,
    setPosition,
  } = useThumbsMotions({
    snapPoints,
    snapRange,
    interactiveAreaRect,
  });

  const transform = (value: number) => interactiveAreaWidth ?
    Math.max(0, Math.min(value / interactiveAreaWidth, 1)) :
    0;

  const valueMotion = useTransform(() => transform(touchMotion.get()));
  useMotionValueEvent(valueMotion, 'change', value => {
    /*
      When the value change occurs not during the slider usage, it means it's a result
      of value overrider from outside, so we don't communicate it back to the outside.
     */
    if (isUsingSliderRef.current) onValueChange(value);
  });

  useEffect(
    () => {
      if (!interactiveAreaWidth) return;

      if (value === valueMotion.get()) return;

      touchMotion.set(Math.max(0, Math.min(value * interactiveAreaWidth, interactiveAreaWidth)));
    },
    // Only 'value' and 'interactiveAreaWidth' are necessary for calculations
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, interactiveAreaWidth]
  );

  const thumbMotion = useOvershootLimitedSpringMotion(touchMotion, interactiveAreaWidth);
  const progressMotion = useTransform(thumbMotion,
    interactiveAreaWidth ? [0, interactiveAreaWidth] : [0, 0],
    [0, 1],
  );

  const {
    isHoverThumbVisible,
    eventsListeners: hoverThumbEventsListeners,
    onAxisLabelClick,
    hoverSnappedAtIndex,
    setHoverSnappedAtIndex,
  } = useHoverThumbInteractions();

  useOnSnap(
    hoverMotion,
    snapPointsPositions,
    setHoverSnappedAtIndex,
    () => void setHoverSnappedAtIndex(null)
  );

  useOnSnap(touchMotion, snapPointsPositions, () => 'vibrate' in navigator && navigator.vibrate(200));

  return (
    <Container className={className} $highlighted={!!highlighted} onMouseEnter={() => void update()}>
      <Track $gaps={snapPoints}>
        <Progress
          style={{ scaleX: progressMotion }}
          initial={false}
        />
      </Track>
      <TangibleThumb
        $thumbSize={19}
        $alwaysVisible={
          hasTouchCapability ?? true // if we don't know - show the thumb just in case
        }
        style={{ x: thumbMotion }}
        {...mergeEventListeners([
          sliderUsageTrackingListeners,
          dragEventsListeners ?? {},
        ])}
      />
      <HoverThumb
        $thumbSize={15}
        style={{ x: hoverMotion }}
        animate={{ opacity: isHoverThumbVisible ? 0.75 : 0 }}
      />
      {snapPointsPositions && (
        <AxisContainer
          $isAxisHovering={!!isAxisHovering}
          $isAxisAlwaysVisible={(!hasHoverCapability || !!isAxisAlwaysVisible)}
        >
          <Axis
            data={snapPoints.map((snapPoint, i) => ({
              text: snapPoint === 1 ? 'MAX' : `${Math.round(snapPoint * 100)}%`,
              position: snapPointsPositions[i],
            }))}
            highlightedIndex={hoverSnappedAtIndex}
            onLabelClick={value => {
              onValueChange(transform(setPosition(value)));
              onAxisLabelClick();
            }}
            onLabelHover={i => {
              setHoverSnappedAtIndex(i);
              hoverMotion.set(snapPointsPositions[i]);
            }}
            onLabelUnhover={() => void setHoverSnappedAtIndex(null)}
          />
        </AxisContainer>
      )}
      <InteractiveArea
        ref={interactiveAreaRef}
        {...mergeEventListeners([
          sliderUsageTrackingListeners,
          dragEventsListeners ?? {},
          hoverThumbEventsListeners,
        ])}
      />
    </Container>
  );
};

export default InteractiveSlider;

// this component helps keeping a clear interaction area responsibility, independent of other containers playing layouting role
const InteractiveArea = styled(motion.div)`
  align-self: stretch;
  grid-area: 1 / 1 / 2 / 2;
  cursor: pointer;

  touch-action: none; /* to support the sliding behavior on touch screens (https://www.framer.com/motion/gestures/###onpan) */
  z-index: 1; /* in order to render over the <Thumb>'s z-index */
`;

const Track = styled(ProgressBar.Track)<{ $gaps: number[] }>`
  grid-area: 1 / 1 / 2 / 2;

  mask-image: linear-gradient(to right,
    ${props => props.$gaps
        .filter(gap => gap !== 0 && gap !== 1) /* we don't want to draw the gaps on the edges of the slider */
        .map(gap => {
          const gapPercents = gap * 100;

          return `black calc(${gapPercents}% - 0.5px), transparent calc(${gapPercents}% - 1px), transparent calc(${gapPercents}% + 1px), black calc(${gapPercents}% + 1px),`;
        }).join('\n')
    }
    black 100%
  );
`;

const Progress = styled(ProgressBar.Progress)`
  background-color: var(${FORE_GROUND_TRACK_COLOR_VAR});
  transition: background-color ${transitionTime};
`;

const TangibleThumb = styled(Thumb)<{
  $alwaysVisible: boolean,
  $thumbSize: number, /* repeating the prop type from `<Thumb>` for TS not to throw TS2769 (an SC bug probably) */
}>`
  opacity: ${props => props.$alwaysVisible ? 1 : 0};
  transition: opacity ${transitionTime};
`;

const HoverThumb = styled(Thumb)`
  pointer-events: none;
`;

const fadeOutAnimation = keyframes`
  from {
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const AxisContainer = styled.div<{ $isAxisHovering: boolean, $isAxisAlwaysVisible: boolean }>`
  grid-area: 2 / 1 / 3 / 2;
  opacity: ${props => props.$isAxisAlwaysVisible ? 1 : 0};
  transition: opacity 0.3s;

  animation: ${fadeOutAnimation} 2s ease-in;
  animation-play-state: ${props => props.$isAxisAlwaysVisible ? 'paused' : 'running'};
  
  ${props => props.$isAxisHovering && css`height: 0;`}
`;

const Container = styled(motion.div)<{ $highlighted: boolean }>`
  ${FORE_GROUND_TRACK_COLOR_VAR}: ${props => props.$highlighted ?
    vars('--color-status-danger-background-3-rest') :
    vars('--color-brand-background-compound-rest')
  };
  
  display: grid;
  align-items: center;

  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  
  ${props => !props.$highlighted && css`
    &:has(${InteractiveArea}:hover) {
      ${FORE_GROUND_TRACK_COLOR_VAR}: ${vars('--color-brand-background-compound-hover')};
    }

    &:has(${InteractiveArea}:active) {
      ${FORE_GROUND_TRACK_COLOR_VAR}: ${vars('--color-brand-background-compound-pressed')};
    }
  `}
  
  &:hover, &:active {
    ${TangibleThumb} {
      transition: opacity ${transitionTime} 0s;
      opacity: 1;
    }
    
    ${AxisContainer} {
      opacity: 1;
    }
  }
`;
