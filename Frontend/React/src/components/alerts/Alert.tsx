// ============================================================
// GLOBAL ALERT COMPONENT (MUI TOAST)
// ============================================================

import React, { useEffect } from 'react';
import MuiAlert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import './Alert.css';

export interface AlertProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  autoHideDuration?: number;
}

const Alert: React.FC<AlertProps> = ({ 
  isOpen, 
  message, 
  onClose, 
  autoHideDuration = 3000 // Auto dismiss after 3 seconds
}) => {
  // --- AUTO-DISMISS TIMER ---
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoHideDuration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="alert-toast-container">
      <Stack sx={{ width: '100%', maxWidth: 500 }}>
        <MuiAlert
          variant="outlined"
          severity="error" // Default to error for form validation
          onClose={onClose}
          sx={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {message}
        </MuiAlert>
      </Stack>
    </div>
  );
};

export default Alert;