'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

import { Dialog } from './MDialog';

interface DialogOptions {
  title?: string;
  description?: string;
  class?: string;
  content: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
}

interface DialogContextType {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
}

interface DialogState {
  isOpen: boolean;
  options: DialogOptions | null;
}

const CLOSED_STATE: DialogState = { isOpen: false, options: null };

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogState, setDialogState] = useState<DialogState>(CLOSED_STATE);

  const showDialog = (options: DialogOptions) => {
    setDialogState({ isOpen: true, options });
  };

  const hideDialog = () => {
    const onClose = dialogState.options?.onClose;
    setDialogState(CLOSED_STATE);
    onClose?.();
  };

  return (
    <DialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      {dialogState.options && (
        <Dialog
          open={dialogState.isOpen}
          onOpenChange={(open) => {
            if (!open) hideDialog();
          }}
          title={dialogState.options.title}
          styles={dialogState.options.class}
          description={dialogState.options.description}
          footer={dialogState.options.footer}
        >
          {dialogState.options.content}
        </Dialog>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
