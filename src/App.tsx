import React from 'react';
import { WalletProvider } from './wallet/hooks';
import { AutoConnectHandler } from './components/wallet/AutoConnectHandler';
import { UnifiedSession } from './wallet/types';

const App: React.FC = () => {
  const handleSessionEstablished = (session: UnifiedSession) => {
    console.log('Session established:', session);
    // Initialize any session-dependent features
  };

  const handleSessionTerminated = () => {
    console.log('Session terminated');
    // Clean up any session-dependent state
  };

  return (
    <WalletProvider>
      <AutoConnectHandler
        onSessionEstablished={handleSessionEstablished}
        onSessionTerminated={handleSessionTerminated}
      />
      {/* Rest of your app components */}
    </WalletProvider>
  );
};

export default App; 