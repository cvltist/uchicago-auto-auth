document.addEventListener('DOMContentLoaded', async () => {
  const enableToggle = document.getElementById('enableToggle');
  const status = document.getElementById('status');
  const settingsBtn = document.getElementById('settingsBtn');

  // Load settings
  async function loadSettings() {
    return new Promise(resolve => {
      browser.storage.local.get(['cnetid', 'password', 'enabled'], result => {
        resolve(result);
      });
    });
  }

  // Update UI based on settings
  async function updateUI() {
    const settings = await loadSettings();

    // Update toggle
    enableToggle.checked = settings.enabled !== false;

    // Update status message
    if (!settings.cnetid || !settings.password) {
      status.textContent = 'Credentials not configured';
      status.className = 'status warning';
      enableToggle.disabled = true;
    } else if (settings.enabled !== false) {
      status.textContent = 'Ready to auto-login';
      status.className = 'status ready';
      enableToggle.disabled = false;
    } else {
      status.textContent = 'Auto-login disabled';
      status.className = 'status disabled';
      enableToggle.disabled = false;
    }
  }

  // Handle toggle change
  enableToggle.addEventListener('change', async () => {
    await browser.storage.local.set({ enabled: enableToggle.checked });
    await updateUI();
  });

  // Handle settings button
  settingsBtn.addEventListener('click', () => {
    browser.runtime.openOptionsPage();
    window.close();
  });

  // Initial update
  await updateUI();
});