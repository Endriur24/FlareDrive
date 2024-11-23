import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface NotificationSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
  severity?: 'success' | 'info' | 'warning' | 'error';
  autoHideDuration?: number;
}

function NotificationSnackbar({
  open,
  message,
  onClose,
  severity = 'info',
  autoHideDuration = 3000
}: NotificationSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={onClose} 
        severity={severity}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export default NotificationSnackbar;
