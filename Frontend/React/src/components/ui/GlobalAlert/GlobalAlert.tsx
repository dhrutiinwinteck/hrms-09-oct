import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// Define the props so you can reuse this for Success, Error, Info, Warning
interface GlobalAlertProps {
  severity: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  onClose?: () => void;
}

const GlobalAlert: React.FC<GlobalAlertProps> = ({ severity, title, message, onClose }) => {
    
  return (
    <Box 
      sx={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', // Centers the alert horizontally
        marginY: 2 // Adds spacing top and bottom
      }}
    >
      <Stack sx={{ width: '100%', maxWidth: '600px' }} spacing={1}>
        <Alert 
          severity={severity} 
          onClose={onClose ? onClose : undefined}
          sx={{ 
            // OPTIONAL: Make it look exactly like your dark image
            backgroundColor: severity === 'error' ? '#2a0e0e' : 
                            severity === 'warning' ? '#2a1f0e' : 
                            severity === 'info' ? '#0e1e2a' : '#0e2a1a',
            color: '#fff',
            borderRadius: 2,
            '& .MuiAlert-icon': {
              color: severity === 'error' ? '#ff6b6b' :
                     severity === 'warning' ? '#ffd93d' :
                     severity === 'info' ? '#4dabf7' : '#51cf66'
            }
          }}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>{title}</AlertTitle>
          {message}
        </Alert>
      </Stack>
    </Box>
  );
};

export default GlobalAlert;