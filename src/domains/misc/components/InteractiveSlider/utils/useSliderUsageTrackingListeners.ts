import { motion } from 'framer-motion';
import { ComponentProps, useRef } from 'react';

export default () => {
  const isUsingSliderRef = useRef(false);

  return [
    isUsingSliderRef,
    {
      onTapStart: () => {
        isUsingSliderRef.current = true;
      },
      onTap: () => {
        isUsingSliderRef.current = false;
      },
      onTapCancel: () => {
        isUsingSliderRef.current = false;
      },
    } satisfies ComponentProps<typeof motion.div>,
  ] as const;
};
