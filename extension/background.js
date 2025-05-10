// State management
let state = {
  accounts: [],
  isConnected: false,
  chainId: '0x1', // Default to mainnet
  pendingRequests: new Map()
};

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FREOBUS_REQUEST') {
    handleProviderRequest(message, sender.tab.id);
  }
  return true; // Keep the message channel open for async responses
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FREOBUS_GET_STATE') {
    sendResponse(state);
  }
  return true;
});

// Handle provider requests
async function handleProviderRequest(message, tabId) {
  const { id, payload } = message;
  
  try {
    let result;
    
    switch (payload.method) {
      case 'eth_requestAccounts':
        result = await handleAccountsRequest();
        break;
      case 'eth_accounts':
        result = state.accounts;
        break;
      case 'eth_chainId':
        result = state.chainId;
        break;
      case 'wallet_disconnect':
        await handleDisconnect();
        result = true;
        break;
      default:
        throw new Error(`Unsupported method: ${payload.method}`);
    }

    // Send response back to content script
    chrome.tabs.sendMessage(tabId, {
      type: 'FREOBUS_RESPONSE',
      id,
      result
    });

    // Broadcast state update to all tabs
    broadcastStateUpdate();
  } catch (error) {
    chrome.tabs.sendMessage(tabId, {
      type: 'FREOBUS_RESPONSE',
      id,
      error: error.message
    });
  }
}

// Handle account requests
async function handleAccountsRequest() {
  // Check if already connected
  if (state.isConnected && state.accounts.length > 0) {
    return state.accounts;
  }

  // Open popup for user approval
  await chrome.windows.create({
    url: 'popup.html',
    type: 'popup',
    width: 400,
    height: 600
  });

  // Wait for user approval
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 30000);

    const listener = (message) => {
      if (message.type === 'FREOBUS_APPROVE_ACCOUNTS') {
        clearTimeout(timeout);
        chrome.runtime.onMessage.removeListener(listener);
        state.accounts = message.accounts;
        state.isConnected = true;
        resolve(message.accounts);
      } else if (message.type === 'FREOBUS_REJECT_ACCOUNTS') {
        clearTimeout(timeout);
        chrome.runtime.onMessage.removeListener(listener);
        reject(new Error('User rejected the request'));
      }
    };

    chrome.runtime.onMessage.addListener(listener);
  });
}

// Handle disconnect
async function handleDisconnect() {
  state.accounts = [];
  state.isConnected = false;
  broadcastStateUpdate();
}

// Broadcast state updates to all tabs
function broadcastStateUpdate() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'FREOBUS_STATE_UPDATE',
        state: {
          accounts: state.accounts,
          isConnected: state.isConnected,
          chainId: state.chainId
        }
      }).catch(() => {
        // Ignore errors for tabs that don't have our content script
      });
    });
  });
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  // Set up initial state
  state = {
    accounts: [],
    isConnected: false,
    chainId: '0x1',
    pendingRequests: new Map()
  };
}); 