import { motion, useMotionValue } from 'framer-motion';
import { ComponentProps, MouseEventHandler, useRef } from 'react';

import { SnapPoint, SnapRange } from '../types.ts';

type EventListeners = Pick<ComponentProps<typeof motion.div>, 'onPan' | 'onPanEnd' | 'onTapStart'> & {
  onMouseMove: MouseEventHandler<HTMLDivElement>,
};

export default ({ snapPoints, snapRange, interactiveAreaRect }: {
  snapPoints: SnapPoint[],
  snapRange: SnapRange,
  /**
   * Bounding client rect of the drag area. While the dragging gesture is read on
   * the entire 2D surface, the output is transformed to just a 1D, horizontal position.
   */
  interactiveAreaRect: DOMRect | undefined,
}) => {
  // for the touching gestures
  const touchActiveSnapZoneIndex = useRef<number | null>(snapPoints.length ? 0 : null);
  const touchMotion = useMotionValue(0);

  // for the hovering gestures
  const hoverMotion = useMotionValue(0);

  if (!interactiveAreaRect) return { touchMotion, hoverMotion };

  const slidingAreaWidth = interactiveAreaRect.right - interactiveAreaRect.left;

  const snapPointsPositions = snapPoints.map(snapPoint => slidingAreaWidth * snapPoint);

  const setImmediatePosition = (positionRelativeToViewport: number) => {
    const {
      positionAccountedForSnapping,
      positionWithoutSnapping,
      snapZoneIndex,
    } = calcPositionAccountedForSnapping(
      positionRelativeToViewport,
      snapPointsPositions,
      snapRange,
      interactiveAreaRect,
    );

    const shouldSnap = snapZoneIndex !== touchActiveSnapZoneIndex.current;

    const position = shouldSnap ? positionAccountedForSnapping : positionWithoutSnapping;
    touchMotion.set(position);

    touchActiveSnapZoneIndex.current = snapZoneIndex;

    return position;
  };

  // using pan gestures instead of the drag ones, because the pan gestures are lower-level and give us more control
  const interactiveAreaEventsListeners = {
    onTapStart: (_, info) => {
      setImmediatePosition(info.point.x);
    },
    onPan: (_, info) => {
      const gestureStartingPosition = info.point.x - info.offset.x;

      const {
        positionAccountedForSnapping,
        snapZoneIndex: currentSnapZoneIndex,
        positionWithoutSnapping,
      } = calcPositionAccountedForSnapping(info.point.x, snapPointsPositions, snapRange, interactiveAreaRect);

      const { snapZoneIndex: gestureStartingSnapZoneIndex } = calcPositionAccountedForSnapping(
        gestureStartingPosition,
        snapPointsPositions,
        snapRange,
        interactiveAreaRect,
      );

      /*
        Ignoring non-null "currentSnapZoneIndex" makes it possible to revert to "snapping mode" once
        left the snap zone and got back to it during a single pan gesture.
       */
      if (typeof currentSnapZoneIndex !== 'number') touchActiveSnapZoneIndex.current = currentSnapZoneIndex;

      const shouldBeSnapped =
        currentSnapZoneIndex !== gestureStartingSnapZoneIndex ||
        touchActiveSnapZoneIndex.current === null;

      touchMotion.set(shouldBeSnapped ? positionAccountedForSnapping : positionWithoutSnapping);
    },
    onPanEnd: () => {
      const position = touchMotion.get();

      if (position > slidingAreaWidth) touchMotion.set(slidingAreaWidth);
      if (position < 0) touchMotion.set(0);
    },
    onMouseMove: e => {
      const {
        positionAccountedForSnapping,
        positionWithoutSnapping,
        snapZoneIndex,
      } = calcPositionAccountedForSnapping(e.pageX, snapPointsPositions, snapRange, interactiveAreaRect);
      const newPosition = snapZoneIndex === touchActiveSnapZoneIndex.current ?
        positionWithoutSnapping :
        positionAccountedForSnapping;

      hoverMotion.set(newPosition);
    },
  } satisfies EventListeners;

  const setPosition = (position: number) => setImmediatePosition(position + interactiveAreaRect.left);

  return {
    interactiveAreaEventsListeners,
    touchMotion,
    hoverMotion,
    snapPointsPositions,
    setPosition,
  };
};

const calcPositionAccountedForSnapping = (
  positionRelativeToViewport: number,
  snapPointsPositions: number[],
  snapRange: SnapRange,
  interactiveAreaRect: DOMRect,
) => {
  const positionWithoutSnapping = positionRelativeToViewport - interactiveAreaRect.left;

  const snapPointPositionWithinSnapRangeIndex = snapPointsPositions.findIndex(snapPointPosition => {
    const distanceToSnapPoint = Math.abs(positionWithoutSnapping - snapPointPosition);

    return distanceToSnapPoint <= snapRange;
  });
  const snapPointPositionWithinSnapRange =
    snapPointsPositions[snapPointPositionWithinSnapRangeIndex] as number | undefined;
  const snapZoneIndex = snapPointPositionWithinSnapRangeIndex >= 0 ? snapPointPositionWithinSnapRangeIndex : null;

  const positionAccountedForSnapping = snapPointPositionWithinSnapRange ?? positionWithoutSnapping;

  return {
    positionWithoutSnapping,
    positionAccountedForSnapping,
    snapZoneIndex,
  };
};
