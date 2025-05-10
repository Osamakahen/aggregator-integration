import './globals.css';
import type { Metadata } from 'next';
import { WalletProvider } from './context/WalletContext';
import { NetworkProvider } from './context/NetworkContext';
import { DAppProvider } from './components/DAppProvider';

export const metadata: Metadata = {
  title: 'FreoWallet',
  description: 'Your secure and easy-to-use Web3 wallet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <NetworkProvider>
            <DAppProvider>
              <main className="min-h-screen bg-[#1E1E1E] text-white">
                {children}
              </main>
            </DAppProvider>
          </NetworkProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
