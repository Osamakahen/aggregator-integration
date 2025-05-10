import { ethers } from 'ethers';
import { ProviderState } from './types';

class PopupUI {
  private state: ProviderState = {
    accounts: [],
    isConnected: false,
    chainId: null
  };

  private elements = {
    accountInfo: document.getElementById('account-info') as HTMLElement,
    connectButton: document.getElementById('connect-button') as HTMLButtonElement,
    disconnectButton: document.getElementById('disconnect-button') as HTMLButtonElement,
    networkSelect: document.getElementById('network-select') as HTMLSelectElement,
    balanceDisplay: document.getElementById('balance-display') as HTMLElement
  };

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Set up event listeners
    this.elements.connectButton.addEventListener('click', () => this.handleConnect());
    this.elements.disconnectButton.addEventListener('click', () => this.handleDisconnect());
    this.elements.networkSelect.addEventListener('change', (e) => this.handleNetworkChange(e));

    // Get initial state
    this.getState();
  }

  private async getState(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'FREOBUS_GET_STATE' });
      if (response?.state) {
        this.state = response.state;
        this.updateUI();
      }
    } catch (error) {
      console.error('Failed to get state:', error);
    }
  }

  private async handleConnect(): Promise<void> {
    try {
      const accounts = await chrome.runtime.sendMessage({
        type: 'FREOBUS_REQUEST',
        payload: { method: 'eth_requestAccounts' }
      });

      if (accounts?.length > 0) {
        this.state.accounts = accounts;
        this.state.isConnected = true;
        this.updateUI();
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  }

  private async handleDisconnect(): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        type: 'FREOBUS_REQUEST',
        payload: { method: 'wallet_disconnect' }
      });

      this.state.accounts = [];
      this.state.isConnected = false;
      this.updateUI();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  private async handleNetworkChange(event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    const chainId = select.value;

    try {
      await chrome.runtime.sendMessage({
        type: 'FREOBUS_REQUEST',
        payload: {
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }]
        }
      });

      this.state.chainId = chainId;
      this.updateUI();
    } catch (error) {
      console.error('Failed to switch network:', error);
      // Reset select to current chain
      select.value = this.state.chainId || '0x1';
    }
  }

  private async updateUI(): Promise<void> {
    // Update connection status
    this.elements.connectButton.style.display = this.state.isConnected ? 'none' : 'block';
    this.elements.disconnectButton.style.display = this.state.isConnected ? 'block' : 'none';
    this.elements.accountInfo.style.display = this.state.isConnected ? 'block' : 'none';

    if (this.state.isConnected && this.state.accounts.length > 0) {
      const account = this.state.accounts[0];
      this.elements.accountInfo.textContent = `Account: ${this.formatAddress(account)}`;
      await this.updateBalance(account);
    } else {
      this.elements.accountInfo.textContent = 'Not connected';
      this.elements.balanceDisplay.textContent = '';
    }

    // Update network selection
    this.elements.networkSelect.value = this.state.chainId || '0x1';
  }

  private async updateBalance(account: string): Promise<void> {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(account);
      this.elements.balanceDisplay.textContent = `Balance: ${ethers.utils.formatEther(balance)} ETH`;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      this.elements.balanceDisplay.textContent = 'Failed to fetch balance';
    }
  }

  private formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

// Initialize the popup UI when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupUI();
}); 