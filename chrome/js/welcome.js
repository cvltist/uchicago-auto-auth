let currentStep = 1;

// Navigation functions
function goToStep(step) {
  // Hide all steps
  document.querySelectorAll('.step-content').forEach(el => {
    el.classList.add('hidden');
  });

  // Show target step
  document.getElementById(`step${step}`).classList.remove('hidden');

  // Update indicators
  document.querySelectorAll('.step').forEach((el, index) => {
    el.classList.remove('active', 'completed');
    if (index + 1 < step) {
      el.classList.add('completed');
    } else if (index + 1 === step) {
      el.classList.add('active');
    }
  });

  currentStep = step;
}

// Get Started button
document.getElementById('getStartedBtn').addEventListener('click', function() {
  goToStep(2);
});

// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', function() {
  const passwordInput = document.getElementById('password');
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  this.textContent = type === 'password' ? 'Show' : 'Hide';
});

// Handle Enter key on password field
document.getElementById('password').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('saveBtn').click();
  }
});

// Handle Enter key on CNETID field
document.getElementById('cnetid').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    // Move focus to password field
    document.getElementById('password').focus();
  }
});

// Save credentials
document.getElementById('saveBtn').addEventListener('click', async function() {
  const cnetid = document.getElementById('cnetid').value.trim();
  const password = document.getElementById('password').value;
  const enableAuth = document.getElementById('enableAuth').checked;
  const autoTrust = document.getElementById('autoTrust').checked;

  // Clear errors
  document.getElementById('cnetid-error').textContent = '';
  document.getElementById('password-error').textContent = '';

  // Validate
  let hasError = false;
  if (!cnetid) {
    document.getElementById('cnetid-error').textContent = 'Please enter your CNET ID';
    hasError = true;
  }
  if (!password) {
    document.getElementById('password-error').textContent = 'Please enter your password';
    hasError = true;
  }

  if (hasError) return;

  // Save to storage
  this.disabled = true;
  this.textContent = 'Saving...';

  try {
    await chrome.storage.local.set({
      cnetid: cnetid,
      password: password,
      enabled: enableAuth,
      autoTrust: autoTrust,
      firstRun: false
    });

    // Success! Move to next step
    goToStep(3);
  } catch (error) {
    console.error('Error saving credentials:', error);
    alert('Error saving credentials. Please try again.');
    this.disabled = false;
    this.textContent = 'Save & Continue';
  }
});

// Open settings button
document.getElementById('openSettingsBtn').addEventListener('click', function() {
  chrome.runtime.openOptionsPage();
  window.close();
});

// Test login button
document.getElementById('testLoginBtn').addEventListener('click', function() {
  chrome.tabs.create({
    url: 'https://portal.uchicago.edu/ais/'
  });
  window.close();
});

// Check if returning user
chrome.storage.local.get(['cnetid', 'firstRun'], (result) => {
  if (result.cnetid && !result.firstRun) {
    // User already set up, skip to success
    goToStep(3);
  }
});