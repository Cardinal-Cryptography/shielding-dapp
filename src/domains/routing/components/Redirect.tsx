import { replaceUnsafe, useLocation } from '@swan-io/chicane';
import { useLayoutEffect } from 'react';

// https://github.com/swan-io/chicane/blob/ab62f7a098f8b0abc6b2e9d4f618d79fbfab337b/example/src/Redirect.tsx
const Redirect = ({ to }: { to: string }) => {
  const location = useLocation().toString();

  useLayoutEffect(() => {
    if (to !== location) {
      replaceUnsafe(to);
    }
  }, [location, to]);

  return null;
};

export default Redirect;
