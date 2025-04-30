import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

export type TransactionStatus = 'pending' | 'success' | 'error';

interface TransactionStatusProps {
  status: TransactionStatus;
  message?: string;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ status, message }) => {
  if (status === 'pending') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} />
        <Typography>Transaction in progress...</Typography>
      </Box>
    );
  }

  if (status === 'success') {
    return (
      <Alert severity="success">
        {message || 'Transaction completed successfully!'}
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert severity="error">
        {message || 'Transaction failed. Please try again.'}
      </Alert>
    );
  }

  return null;
}; 