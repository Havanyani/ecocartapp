import { Toast, ToastProps } from '@/components/ui/Toast';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface ToastContextValue {
  showToast: (props: Omit<ToastProps, 'onClose'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastProps, setToastProps] = useState<ToastProps | null>(null);

  const showToast = useCallback((props: Omit<ToastProps, 'onClose'>) => {
    setToastProps({
      ...props,
      onClose: () => setToastProps(null),
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastProps && <Toast {...toastProps} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 