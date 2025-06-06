import { useAppKitState } from '@reown/appkit/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  ReactElement,
} from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

import vars from 'src/domains/styling/utils/vars';

import Modal from './Modal';

type Modal = {
  id: string,
  modal: ReactElement,
  page?: number,
};

type ModalContextType = {
  mount: (modal: Modal, options?: { checkDuplicateBy?: string[] }) => void,
  unmount: (id: string) => void,
  updateId: (oldId: string, newId: string) => Promise<Modal | null>,
  getModals: () => Modal[],
  modals: Modal[],
};

type ModalControlsContextType = {
  close: () => void,
  isTopModal: boolean,
  isLast: boolean,
};
const ModalContext = createContext<ModalContextType | null>(null);
const ModalControlsContext = createContext<ModalControlsContextType | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const { open: isWalletConnectModalOpen } = useAppKitState();
  const [modals, setModals] = useState<Modal[]>([]);

  const mount = useCallback((modal: Modal) => {
    setModals(prev => {
      const isAlreadyMounted = prev.find(m => m.id === modal.id);
      if (isAlreadyMounted) {
        console.warn(`Modal "${modal.id}" already exists. Replacing and moving to top.`);
        const filtered = prev.filter(m => m.id !== modal.id);
        return [{ ...modal, page: 0 }, ...filtered];
      }
      return [{ ...modal, page: 0 }, ...prev];
    });
  }, []);

  const unmount = useCallback((id: string) => {
    setModals(prev => prev.filter(m => m.id !== id));
  }, []);

  const updateId = useCallback(async (oldId: string, newId: string): Promise<Modal | null> => {
    return new Promise(resolve => {
      setModals(prev => {
        const modalIndex = prev.findIndex(modal => modal.id === oldId);

        if (modalIndex === -1) {
          resolve(null);
          return prev;
        }

        const updatedModal = { ...prev[modalIndex], id: newId };
        const updatedModals = prev.map((modal, index) =>
          index === modalIndex ? updatedModal : modal
        );

        resolve(updatedModal);
        return updatedModals;
      });
    });
  }, []);

  const getModals = () => modals;

  return (
    <ModalContext.Provider value={{ mount, unmount, updateId, modals, getModals }}>
      {children}
      {createPortal(
        <AnimatePresence>
          {!isWalletConnectModalOpen && !!modals.length && (
            <Backdrop
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3 }}
            >
              {modals.map(({ id, modal }, i) => (
                <ModalControlsContext.Provider
                  key={id}
                  value={{
                    close: () => void unmount(id),
                    isTopModal: i === 0,
                    isLast: modals.length === 1,
                  }}
                >
                  {modal}
                </ModalControlsContext.Provider>
              ))}
            </Backdrop>
          )}
        </AnimatePresence>,
        document.body
      )}
    </ModalContext.Provider>
  );
};

export const useModals = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModals must be used within ModalProvider');

  return ctx;
};

export const useModal = () => {
  const { mount, unmount, modals, updateId: _updateId } = useModals();
  const defaultId = useRef(uuidv4()).current;
  const currentIdRef = useRef<string>(defaultId);

  const open = useCallback((modalElement: ReactElement, options?: { idOverride?: string }) => {
    const modalId = options?.idOverride ?? defaultId;
    currentIdRef.current = modalId;
    mount({ id: modalId, modal: modalElement });
  }, [defaultId, mount]);

  const close = useCallback(() => {
    unmount(currentIdRef.current);
  }, [unmount]);

  const updateId = async (newId: string) => {
    return _updateId(currentIdRef.current, newId);
  };

  const modal = modals.find(m => m.id === currentIdRef.current);

  return {
    open,
    close,
    isOpen: !!modal,
    updateId,
  };
};

export const useModalControls = () => {
  const ctx = useContext(ModalControlsContext);
  if (!ctx) throw new Error('useModal must be used within ModalControlsProvider');

  return ctx;
};

const Backdrop = styled(motion.div)`
  display: flex;

  position: fixed;
  inset: 0;

  justify-content: center;
  align-items: center;

  width: 100dvw;

  background: ${vars('--color-neutral-background-overlay-rest')};

  z-index: 999;
`;
