import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { TransactionStatus } from './TransactionStatus';

interface Transaction {
  id: string;
  fromToken: string;
  toToken: string;
  amountIn: string;
  amountOut: string;
  status: 'pending' | 'success' | 'error';
  timestamp: number;
  hash?: string;
}

export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // TODO: Fetch transactions from blockchain
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        fromToken: 'USDC',
        toToken: 'WETH',
        amountIn: '100',
        amountOut: '0.05',
        status: 'success',
        timestamp: Date.now() - 3600000,
        hash: '0x123...abc'
      }
    ];
    setTransactions(mockTransactions);
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Transaction History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{tx.fromToken}</TableCell>
                <TableCell>{tx.toToken}</TableCell>
                <TableCell>{tx.amountIn} → {tx.amountOut}</TableCell>
                <TableCell>
                  <TransactionStatus status={tx.status} />
                </TableCell>
                <TableCell>
                  {new Date(tx.timestamp).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}; 