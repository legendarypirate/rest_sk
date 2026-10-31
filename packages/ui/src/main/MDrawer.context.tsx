'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { Drawer, type DrawerWidth } from './MDrawer';

type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

interface DrawerOptions {
  title?: string;
  description?: string;
  class?: string;
  content: ReactNode;
  side?: DrawerSide;
  /** Preset width for left/right drawers. Default: `xl`. */
  width?: DrawerWidth;
  onClose?: () => void;
}

interface DrawerContextType {
  showDrawer: (options: DrawerOptions) => void;
  hideDrawer: () => void;
}

interface DrawerState {
  isOpen: boolean;
  options: DrawerOptions | null;
}

const CLOSED_STATE: DrawerState = { isOpen: false, options: null };

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [drawerState, setDrawerState] = useState<DrawerState>(CLOSED_STATE);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (drawerState.isOpen) {
      setDrawerState(CLOSED_STATE);
    }
  }

  const showDrawer = (options: DrawerOptions) => {
    setDrawerState({ isOpen: true, options });
  };

  const hideDrawer = () => {
    const onClose = drawerState.options?.onClose;
    setDrawerState(CLOSED_STATE);
    onClose?.();
  };

  return (
    <DrawerContext.Provider value={{ showDrawer, hideDrawer }}>
      {children}
      {drawerState.options && (
        <Drawer
          open={drawerState.isOpen}
          onOpenChange={(open) => {
            if (!open) hideDrawer();
          }}
          title={drawerState.options.title}
          styles={drawerState.options.class}
          description={drawerState.options.description}
          side={drawerState.options.side}
          width={drawerState.options.width ?? 'lg'}
        >
          {drawerState.options.content}
        </Drawer>
      )}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
}
