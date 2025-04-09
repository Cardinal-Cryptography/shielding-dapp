import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/**
 * Gets the bounding client rect updated after both: the element resize and window resize.
 */
export default <T extends HTMLElement = HTMLDivElement>() => {
  const ref = useRef<T | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const update = useCallback(() => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
  }, []);

  useLayoutEffect(() => {
    update(); // Initial update
  }, [update]);

  return [ref, rect ?? undefined, update] as const;
};
