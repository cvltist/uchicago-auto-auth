// Initialize default settings and open setup on install
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set defaults on first install
    browser.storage.local.set({
      enabled: true,
      autoTrust: true,
      firstRun: true
    }, () => {
      console.log('UChicago Auto-Auth: Default settings initialized');
      // Open the welcome/setup page
      browser.tabs.create({
        url: browser.runtime.getURL('welcome.html')
      });
    });
  }
});

// Handle extension icon click - open options
browser.action.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});

// Listen for messages from content scripts
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'log') {
    console.log(`[${sender.tab?.id || 'unknown'}] ${request.message}`);
  }
  return true;
});