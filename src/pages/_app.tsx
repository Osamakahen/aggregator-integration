import React from 'react';
import type { AppProps } from 'next/app';
import { WalletProvider } from '../wallet/hooks';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
} 