import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SwapInterface } from '../SwapInterface';
import { WalletProvider } from '../../../wallet/hooks';

describe('SwapInterface', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <WalletProvider>
        {component}
      </WalletProvider>
    );
  };

  it('renders token selection dropdowns', () => {
    renderWithProvider(<SwapInterface />);
    expect(screen.getByLabelText('From Token')).toBeInTheDocument();
    expect(screen.getByLabelText('To Token')).toBeInTheDocument();
  });

  it('updates amount input', () => {
    renderWithProvider(<SwapInterface />);
    const input = screen.getByLabelText('Amount In');
    fireEvent.change(input, { target: { value: '100' } });
    expect(input).toHaveValue('100');
  });

  it('updates slippage', () => {
    renderWithProvider(<SwapInterface />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 2 } });
    expect(slider).toHaveValue(2);
  });
}); 