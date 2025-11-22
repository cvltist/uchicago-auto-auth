// Initialize default settings and open setup on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set defaults on first install
    chrome.storage.local.set({
      enabled: true,
      autoTrust: true,
      firstRun: true
    }, () => {
      console.log('UChicago Auto-Auth: Default settings initialized');
      // Open the welcome/setup page
      chrome.tabs.create({
        url: chrome.runtime.getURL('welcome.html')
      });
    });
  }
});

// Handle extension icon click - open options
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'log') {
    console.log(`[${sender.tab?.id || 'unknown'}] ${request.message}`);
  }
  return true;
});