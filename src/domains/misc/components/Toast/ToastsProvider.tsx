import {
  ComponentProps,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import AnimatedToastsList from './AnimatedToastsList';
import Toast from './Toast';
import { ToastId } from './types';

type ToastProps = ComponentProps<typeof Toast>;
type ShowToastParamsNames = 'title' | 'status' | 'headerAction' | 'subtitle' | 'body' | 'bodyActions' | 'ttlMs';
type ShowToastParams = Pick<ToastProps, ShowToastParamsNames> & { dismissToast?: () => void };
type DismissableToastProps =
  ShowToastParams &
  Required<Pick<ToastProps, 'creationTimestamp' | 'ttlMs'>> &
  { id: ToastId, dismissToast: () => void };
type DismissThisToast = () => void;
type Context = {
  showToast: (toastProps: ShowToastParams) => {
    dismissToast: DismissThisToast,
    updateToast: (nextParams: Partial<ShowToastParams>) => void,
  },
  isDomNodeInToastsTree: (element: Node) => boolean,
};

const Context = createContext<Context | undefined>(undefined);

type Props = {
  ttlMs: number,
  children: ReactNode,
};

const ToastsProvider = ({ ttlMs, children }: Props) => {
  const getNextId = useGetNextId();
  const [toasts, setToasts] = useState<DismissableToastProps[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const removeToast = useCallback((toastId: ToastId) => {
    setToasts(toasts => toasts.filter(toastData => toastData.id !== toastId));
  }, []);

  const contextValue = useMemo<Context>(() => ({
    showToast: toastProps => {
      const id = getNextId();

      const toastData = {
        id,
        creationTimestamp: Date.now(),
        ttlMs,
        dismissToast: () => void removeToast(id),
        ...toastProps,
      };

      setToasts(toasts => [...toasts, toastData]);

      return {
        dismissToast: () => {
          removeToast(id);
        },
        updateToast: (nextParams: Partial<ShowToastParams>) => {
          setToasts(toasts => toasts.map(toast => toast.id === id ? { ...toast, ... nextParams } : toast));
        },
      };
    },
    isDomNodeInToastsTree: element => !!containerRef.current?.contains(element),
  }), [getNextId, removeToast, ttlMs]);

  return (
    <Context.Provider value={contextValue}>
      {children}
      {createPortal(
        <AnimatedToastsList toasts={toasts} ref={containerRef} />,
        document.body
      )}
    </Context.Provider>
  );
};

export default ToastsProvider;

const useGetNextId = () => {
  const nextIdRef = useRef(0);

  return useCallback(() => {
    const currentId = nextIdRef.current;

    nextIdRef.current++;

    return currentId;
  }, []);
};

export const useToast = () => {
  const contextValue = useContext(Context);

  if (!contextValue) {
    throw new Error('This hook must be used in the context of ToastsProvider.');
  }

  return contextValue;
};
