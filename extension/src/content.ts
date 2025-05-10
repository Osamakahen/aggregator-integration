// Inject the provider script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inpage.js');
script.type = 'text/javascript';
(document.head || document.documentElement).appendChild(script);

// Listen for messages from the injected provider
window.addEventListener('message', (event: MessageEvent) => {
  // Only accept messages from the same frame
  if (event.source !== window) return;

  const message = event.data;

  // Only accept messages that we know are ours
  if (message?.type?.startsWith('FREOBUS_')) {
    // Forward the message to the background script
    chrome.runtime.sendMessage(message).catch(() => {
      // Ignore errors for messages that don't need a response
    });
  }
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Forward the message to the injected provider
  window.postMessage(message, '*');
  sendResponse({ success: true });
  return true;
}); 