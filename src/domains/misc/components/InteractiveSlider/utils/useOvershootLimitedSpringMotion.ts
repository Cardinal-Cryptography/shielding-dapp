import { MotionValue, useSpring, useTransform } from 'framer-motion';

export default (
  motionValue: MotionValue<number>,
  range: number | undefined,
) => {
  const clamped = useTransform(motionValue, x => {
    const safeX = !isNaN(x) ? x : 0;
    if (typeof range !== 'number') return safeX;
    return Math.max(0, Math.min(safeX, range));
  });

  // Применяем spring к ограниченному значению
  const bounceBackLimitedSpring = useSpring(clamped, {
    damping: 17,
    stiffness: 150,
  });
  const overshootLimitedSpring = useTransform(() => {
    const currentX = bounceBackLimitedSpring.get();

    if (!range) return currentX;

    const rightOvershoot = Math.max(0, currentX - range);
    const leftOvershoot = Math.abs(Math.min(0, currentX));

    const newPositionWithinInteractiveArea = Math.max(0, Math.min(currentX, range));

    return newPositionWithinInteractiveArea + rightOvershoot ** 0.75 - leftOvershoot ** 0.75;
  });
  return overshootLimitedSpring;
};
