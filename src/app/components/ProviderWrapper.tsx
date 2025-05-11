'use client';

import { usePathname } from 'next/navigation';
import { WalletProvider } from '../context/WalletContext';
import { NetworkProvider } from '../context/NetworkContext';
import { DAppProvider } from './DAppProvider';

// Routes that require wallet functionality
const WALLET_ROUTES = [
  '/dapps',
  '/marketplace',
  '/connect',
  '/onboarding',
];

export function ProviderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if current route needs wallet functionality
  const needsWallet = WALLET_ROUTES.some(route => pathname?.startsWith(route));

  if (needsWallet) {
    return (
      <WalletProvider>
        <NetworkProvider>
          <DAppProvider>
            {children}
          </DAppProvider>
        </NetworkProvider>
      </WalletProvider>
    );
  }

  // For non-wallet routes, render children without providers
  return <>{children}</>;
} 