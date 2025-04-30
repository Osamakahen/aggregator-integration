import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { WalletPanel } from '../wallet/WalletPanel';
import { SwapInterface } from '../swap/SwapInterface';
import { TransactionHistory } from '../transactions/TransactionHistory';

export const MainLayout: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Aggregator Integration
          </Typography>
          <WalletPanel />
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <SwapInterface />
        <TransactionHistory />
      </Container>
    </Box>
  );
}; 