import { MotionValue, useMotionValueEvent } from 'framer-motion';
import { useEffect, useState } from 'react';
import { isNullish } from 'utility-types';

export default (
  motionValue: MotionValue<number>,
  snapPointsPositions: number[] | undefined,
  onSnap: (snappedAtIndex: number) => unknown,
  onSnapFinished?: () => unknown
) => {
  const [snappedAtIndex, setSnappedAtIndex] = useState<number | null>(null);

  useMotionValueEvent(motionValue, 'change', value => {
    if (!snapPointsPositions) return;

    const snappedSnapPointPositionIndex = snapPointsPositions.findIndex(
      snapPointPosition => Math.abs(snapPointPosition - value) < 1
    );
    setSnappedAtIndex(snappedSnapPointPositionIndex >= 0 ? snappedSnapPointPositionIndex : null);
  });

  useEffect(() => {
    if (!isNullish(snappedAtIndex)) onSnap(snappedAtIndex);
    else onSnapFinished?.();
  }, [snappedAtIndex]); // eslint-disable-line react-hooks/exhaustive-deps
};
