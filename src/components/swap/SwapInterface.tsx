import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Slider, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useWallet } from '../../wallet/hooks';
import { ethers } from 'ethers';

export interface Token {
  address: string;
  symbol: string;
  decimals: number;
}

const DEFAULT_TOKENS: Token[] = [
  { address: '0x7af963cF6D228E564e2A0aA0DdBF06210B38615D', symbol: 'USDC', decimals: 6 },
  { address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', symbol: 'WETH', decimals: 18 }
];

export const SwapInterface: React.FC = () => {
  const { isUnlocked, selectedNetwork } = useWallet();
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [slippage, setSlippage] = useState(1);
  const [tokenIn, setTokenIn] = useState<Token>(DEFAULT_TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<Token>(DEFAULT_TOKENS[1]);
  const [price, setPrice] = useState<string>('0');

  useEffect(() => {
    const fetchPrice = async () => {
      if (!amountIn || !tokenIn || !tokenOut) return;
      // TODO: Implement price fetching from aggregator
      setPrice('1.0');
    };
    fetchPrice();
  }, [amountIn, tokenIn, tokenOut]);

  const handleSwap = async () => {
    if (!isUnlocked) return;
    // TODO: Implement swap logic
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Swap Tokens
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>From Token</InputLabel>
        <Select
          value={tokenIn.address}
          onChange={(e) => setTokenIn(DEFAULT_TOKENS.find(t => t.address === e.target.value) || DEFAULT_TOKENS[0])}
          label="From Token"
        >
          {DEFAULT_TOKENS.map(token => (
            <MenuItem key={token.address} value={token.address}>
              {token.symbol}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Amount In"
        value={amountIn}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmountIn(e.target.value)}
        margin="normal"
      />
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>To Token</InputLabel>
        <Select
          value={tokenOut.address}
          onChange={(e) => setTokenOut(DEFAULT_TOKENS.find(t => t.address === e.target.value) || DEFAULT_TOKENS[1])}
          label="To Token"
        >
          {DEFAULT_TOKENS.map(token => (
            <MenuItem key={token.address} value={token.address}>
              {token.symbol}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Amount Out"
        value={amountOut}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmountOut(e.target.value)}
        margin="normal"
        disabled
      />
      
      <Typography gutterBottom>
        Price: {price} {tokenOut.symbol} per {tokenIn.symbol}
      </Typography>
      
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