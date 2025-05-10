// DOM Elements
const accountInfo = document.getElementById('accountInfo');
const accountAddress = document.getElementById('accountAddress');
const accountBalance = document.getElementById('accountBalance');
const connectionStatus = document.getElementById('connectionStatus');
const networkSelect = document.getElementById('networkSelect');
const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');

// State
let state = {
  accounts: [],
  isConnected: false,
  chainId: '0x1'
};

// Initialize popup
async function initialize() {
  // Get current state from background script
  const response = await chrome.runtime.sendMessage({ type: 'FREOBUS_GET_STATE' });
  state = response;
  updateUI();
}

// Update UI based on state
function updateUI() {
  if (state.isConnected && state.accounts.length > 0) {
    // Show connected state
    accountInfo.style.display = 'block';
    accountAddress.textContent = state.accounts[0];
    connectionStatus.textContent = 'Connected';
    connectionStatus.className = 'status connected';
    connectButton.style.display = 'none';
    disconnectButton.style.display = 'block';
    
    // Update network selector
    networkSelect.value = state.chainId;
    
    // Fetch and display balance
    fetchBalance(state.accounts[0]);
  } else {
    // Show disconnected state
    accountInfo.style.display = 'none';
    connectionStatus.textContent = 'Not Connected';
    connectionStatus.className = 'status disconnected';
    connectButton.style.display = 'block';
    disconnectButton.style.display = 'none';
  }
}

// Fetch account balance
async function fetchBalance(address) {
  try {
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_KEY');
    const balance = await provider.getBalance(address);
    accountBalance.textContent = `${ethers.utils.formatEther(balance)} ETH`;
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    accountBalance.textContent = 'Error fetching balance';
  }
}

// Event Listeners
connectButton.addEventListener('click', async () => {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    state.accounts = accounts;
    state.isConnected = true;
    updateUI();
  } catch (error) {
    console.error('Connection failed:', error);
  }
});

disconnectButton.addEventListener('click', async () => {
  try {
    await window.ethereum.request({ method: 'wallet_disconnect' });
    state.accounts = [];
    state.isConnected = false;
    updateUI();
  } catch (error) {
    console.error('Disconnect failed:', error);
  }
});

networkSelect.addEventListener('change', async (event) => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: event.target.value }]
    });
    state.chainId = event.target.value;
    updateUI();
  } catch (error) {
    console.error('Network switch failed:', error);
    // Reset selector to current network
    networkSelect.value = state.chainId;
  }
});

// Initialize popup when loaded
document.addEventListener('DOMContentLoaded', initialize); 