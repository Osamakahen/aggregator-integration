import React, { useState } from 'react';
import { useWallet } from '../../wallet/hooks';

export function WalletPanel() {
  const { isConnected, accounts, chainId, connect, disconnect } = useWallet();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!isConnected) {
    return (
      <div className="wallet-panel">
        <button 
          onClick={connect} 
          className="connect-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
      </div>
    );
  }
  
  return (
    <div className="wallet-panel bg-white shadow-lg rounded-lg p-4">
      <div 
        className="wallet-header flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="account-info font-medium">
          {accounts[0]?.substring(0, 6)}...{accounts[0]?.substring(38)}
        </div>
        <div className="network-badge bg-gray-100 px-2 py-1 rounded text-sm">
          {getNetworkName(chainId)}
        </div>
      </div>
      
      {isExpanded && (
        <div className="wallet-details mt-4">
          <div className="balance-section mb-4">
            <h3 className="text-sm font-medium text-gray-500">Balance</h3>
            <p className="text-lg font-bold">0.0 ETH</p>
          </div>
          <div className="actions-section">
            <button 
              onClick={disconnect} 
              className="disconnect-button bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getNetworkName(chainId: string): string {
  switch (chainId) {
    case '0x1': return 'Ethereum';
    case '0x89': return 'Polygon';
    case '0xa': return 'Optimism';
    case '0xa4b1': return 'Arbitrum';
    default: return 'Unknown';
  }
} 