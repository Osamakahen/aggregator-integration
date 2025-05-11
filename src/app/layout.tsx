import './globals.css';
import type { Metadata } from 'next';
import { ProviderWrapper } from './components/ProviderWrapper';

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
        <ProviderWrapper>
          <main className="min-h-screen bg-[#1E1E1E] text-white">
            {children}
          </main>
        </ProviderWrapper>
      </body>
    </html>
  );
}
