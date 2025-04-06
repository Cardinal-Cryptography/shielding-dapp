import { RefObject, useRef } from 'react';

const FILLER = Symbol('filler');

const useLazyRef = <T>(initialValue: () => T) => {
  const ref = useRef<T | symbol>(FILLER);
  if (ref.current === FILLER) {
    ref.current = initialValue();
  }

  return ref as RefObject<T>;
};

export default useLazyRef;
