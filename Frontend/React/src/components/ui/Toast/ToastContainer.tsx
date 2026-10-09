// src/components/ui/Toast/ToastContainer.tsx

import React from 'react';
import { Toast } from './Toast';
import { useToast } from '@/hooks/useToast';
import './ToastContainer.css';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};