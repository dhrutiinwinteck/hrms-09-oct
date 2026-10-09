// src/hooks/useToast.ts

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration: number = 3000
  ) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    success: (msg: string, duration?: number) => showToast(msg, 'success', duration),
    error: (msg: string, duration?: number) => showToast(msg, 'error', duration),
    info: (msg: string, duration?: number) => showToast(msg, 'info', duration),
    warning: (msg: string, duration?: number) => showToast(msg, 'warning', duration),
  };
};