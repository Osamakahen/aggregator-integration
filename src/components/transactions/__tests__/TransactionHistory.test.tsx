import React from 'react';
import { render, screen } from '@testing-library/react';
import { TransactionHistory } from '../TransactionHistory';

describe('TransactionHistory', () => {
  it('renders transaction table', () => {
    render(<TransactionHistory />);
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
  });

  it('displays mock transaction data', () => {
    render(<TransactionHistory />);
    expect(screen.getByText('USDC')).toBeInTheDocument();
    expect(screen.getByText('WETH')).toBeInTheDocument();
    expect(screen.getByText('100 → 0.05')).toBeInTheDocument();
  });
}); 