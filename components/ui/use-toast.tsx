"use client";

import * as React from "react";

type Toast = {
  id: string;
  title?: string;
  description?: string;
};

const ToastContext = React.createContext<{
  toasts: Toast[];
  toast: (toast: Omit<Toast, "id">) => void;
}>({
  toasts: [],
  toast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((toast: Omit<Toast, "id">) => {
    setToasts((prev) => [...prev, { ...toast, id: crypto.randomUUID() }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}
