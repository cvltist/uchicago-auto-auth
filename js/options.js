document.addEventListener('DOMContentLoaded', async () => {
  const cnetidInput = document.getElementById('cnetid');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const enabledCheckbox = document.getElementById('enabled');
  const autoTrustCheckbox = document.getElementById('autoTrust');
  const saveCredentialsBtn = document.getElementById('saveCredentials');
  const clearCredentialsBtn = document.getElementById('clearCredentials');
  const saveSettingsBtn = document.getElementById('saveSettings');
  const statusMessage = document.getElementById('statusMessage');

  // Load existing settings with defaults
  async function loadSettings() {
    return new Promise(resolve => {
      chrome.storage.local.get(['cnetid', 'password', 'enabled', 'autoTrust'], result => {
        // Set defaults if not exists
        if (result.enabled === undefined) {
          result.enabled = true;
        }
        if (result.autoTrust === undefined) {
          result.autoTrust = true;
        }
        resolve(result);
      });
    });
  }

  // Show status message
  function showStatus(message, isSuccess = true) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${isSuccess ? 'success' : 'error'}`;
    setTimeout(() => {
      statusMessage.className = 'status-message';
    }, 3000);
  }

  // Toggle password visibility
  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePasswordBtn.textContent = type === 'password' ? 'Show' : 'Hide';
  });

  // Save credentials with visual feedback
  saveCredentialsBtn.addEventListener('click', async () => {
    const cnetid = cnetidInput.value.trim();
    const password = passwordInput.value;

    if (!cnetid) {
      showStatus('Please enter your CNET ID', false);
      return;
    }

    if (!password) {
      showStatus('Please enter your password', false);
      return;
    }

    // Add loading state
    saveCredentialsBtn.disabled = true;
    saveCredentialsBtn.textContent = 'Saving...';

    try {
      await chrome.storage.local.set({
        cnetid: cnetid,
        password: password,
        enabled: true  // Auto-enable when credentials are saved
      });

      showStatus('Credentials saved successfully!');

      // Update button to show success
      saveCredentialsBtn.textContent = 'Saved!';
      saveCredentialsBtn.style.background = '#48bb78';

      // Mask the password after saving
      passwordInput.type = 'password';
      togglePasswordBtn.textContent = 'Show';

      // Reset button after delay
      setTimeout(() => {
        saveCredentialsBtn.disabled = false;
        saveCredentialsBtn.textContent = 'Save Credentials';
        saveCredentialsBtn.style.background = '';
      }, 2000);
    } catch (error) {
      showStatus('Error saving credentials', false);
      console.error(error);
      saveCredentialsBtn.disabled = false;
      saveCredentialsBtn.textContent = 'Save Credentials';
    }
  });

  // Clear all credentials
  clearCredentialsBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all saved credentials? This cannot be undone.')) {
      try {
        await chrome.storage.local.remove(['cnetid', 'password']);
        cnetidInput.value = '';
        passwordInput.value = '';
        showStatus('All credentials cleared');
      } catch (error) {
        showStatus('Error clearing credentials', false);
        console.error(error);
      }
    }
  });

  // Save settings with visual feedback
  saveSettingsBtn.addEventListener('click', async () => {
    // Add loading state
    saveSettingsBtn.disabled = true;
    saveSettingsBtn.textContent = 'Saving...';

    try {
      await chrome.storage.local.set({
        enabled: enabledCheckbox.checked,
        autoTrust: autoTrustCheckbox.checked
      });

      showStatus('Settings saved successfully!');

      // Update button to show success
      saveSettingsBtn.textContent = 'Saved!';
      saveSettingsBtn.style.background = '#48bb78';

      // Reset button after delay
      setTimeout(() => {
        saveSettingsBtn.disabled = false;
        saveSettingsBtn.textContent = 'Save Settings';
        saveSettingsBtn.style.background = '';
      }, 2000);
    } catch (error) {
      showStatus('Error saving settings', false);
      console.error(error);
      saveSettingsBtn.disabled = false;
      saveSettingsBtn.textContent = 'Save Settings';
    }
  });

  // Load existing data
  const settings = await loadSettings();

  // Populate fields
  if (settings.cnetid) {
    cnetidInput.value = settings.cnetid;
  }

  if (settings.password) {
    passwordInput.value = settings.password;
  }

  enabledCheckbox.checked = settings.enabled !== false;
  autoTrustCheckbox.checked = settings.autoTrust !== false;

  // Add Enter key support for credentials
  cnetidInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move focus to password field
      passwordInput.focus();
    }
  });

  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveCredentialsBtn.click();
    }
  });
});