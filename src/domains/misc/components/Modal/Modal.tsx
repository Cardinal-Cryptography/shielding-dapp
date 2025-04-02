import { ComponentProps, forwardRef, lazy, Suspense } from 'react';

import { ModalRef } from './LazyLoadedModal';

const LazyLoadedModal = lazy(() => import('./LazyLoadedModal'));

type Props = ComponentProps<typeof LazyLoadedModal>;

const Modal = forwardRef<ModalRef, Props>((props, ref) => (
  <Suspense fallback={props.triggerElement}>
    <LazyLoadedModal {...props} ref={ref} />
  </Suspense>
));

export default Modal;
