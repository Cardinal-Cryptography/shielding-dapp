import { AnimationPlaybackControls, useAnimate } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default (ttlMs?: number, paused?: boolean, onComplete?: () => void) => {
  const [progressIndicatingElementRef, animateProgressBar] = useAnimate();
  const animationRef = useRef<AnimationPlaybackControls | undefined>(undefined);

  useEffect(() => {
    if (!ttlMs) return;

    animationRef.current = animateProgressBar(
      progressIndicatingElementRef.current,
      { scaleX: 0 },
      {
        duration: ttlMs / 1000,
        ease: 'linear',
        onComplete,
        autoplay: true,
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ttlMs]);

  const shouldBePlaying = !!ttlMs && !paused;

  useEffect(() => {
    if (shouldBePlaying) animationRef.current?.play();
    else animationRef.current?.pause();
  }, [shouldBePlaying]);

  return progressIndicatingElementRef;
};
