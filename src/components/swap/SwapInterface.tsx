import React, { useState, ChangeEvent } from 'react';
import { Box, TextField, Button, Typography, Slider } from '@mui/material';
import { useWallet } from '../../wallet/hooks';

export const SwapInterface: React.FC = () => {
  const { isUnlocked, selectedNetwork } = useWallet();
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [slippage, setSlippage] = useState(1);

  const handleSwap = async () => {
    if (!isUnlocked) return;
    // TODO: Implement swap logic
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Swap Tokens
      </Typography>
      
      <TextField
        fullWidth
        label="Amount In"
        value={amountIn}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setAmountIn(e.target.value)}
        margin="normal"
      />
      
      <TextField
        fullWidth
        label="Amount Out"
        value={amountOut}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setAmountOut(e.target.value)}
        margin="normal"
      />
      
      <Typography gutterBottom>
        Slippage Tolerance: {slippage}%
      </Typography>
      <Slider
        value={slippage}
        onChange={(_: unknown, value: number | number[]) => setSlippage(value as number)}
        min={0.1}
        max={5}
        step={0.1}
      />
      
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={handleSwap}
        disabled={!isUnlocked}
        sx={{ mt: 2 }}
      >
        {isUnlocked ? 'Swap' : 'Connect Wallet to Swap'}
      </Button>
    </Box>
  );
}; 