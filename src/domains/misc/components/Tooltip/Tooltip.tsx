import { ComponentProps, lazy, Suspense } from 'react';

const LazyLoadedTooltip = lazy(() => import('./LazyLoadedTooltip'));

type Props = ComponentProps<typeof LazyLoadedTooltip>;

const Tooltip = (props: Props) => (
  <Suspense fallback={props.children}>
    <LazyLoadedTooltip {...props} />
  </Suspense>
);

export default Tooltip;
