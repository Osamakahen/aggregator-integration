import React from 'react';
import { useWallet } from '../../wallet/hooks';
import { Button } from '@mui/material';

export const ConnectButton: React.FC = () => {
  const { isUnlocked, connect, disconnect } = useWallet();

  return (
    <Button
      variant="contained"
      color={isUnlocked ? "secondary" : "primary"}
      onClick={isUnlocked ? disconnect : connect}
    >
      {isUnlocked ? "Disconnect Wallet" : "Connect Wallet"}
    </Button>
  );
}; 