(async function() {
  let currentStep = null;
  let attemptCount = 0;
  let overlay = null;

  function log(msg, data = '') {
    console.log(`[UChicago Auto-Auth] ${msg}`, data);
  }

  // Initialize overlay
  function initOverlay() {
    if (!overlay && window.AuthOverlay) {
      overlay = new window.AuthOverlay();
      overlay.create();
    }
    return overlay;
  }

  async function getCredentials() {
    return new Promise(resolve => {
      browser.storage.local.get(['cnetid', 'password', 'enabled'], result => {
        resolve(result);
      });
    });
  }

  function fillInput(input, value) {
    log(`Filling input: ${input.name || input.id}`);
    input.focus();
    input.value = value;

    // Trigger all possible events
    ['input', 'change', 'blur'].forEach(eventType => {
      input.dispatchEvent(new Event(eventType, { bubbles: true }));
    });

    // Remove aria-invalid if present
    input.removeAttribute('aria-invalid');
  }

  function clickSubmitButton(button) {
    log(`Clicking button: ${button.value || button.textContent}`);

    // Method 1: Direct click
    button.click();

    // Method 2: Focus and click
    setTimeout(() => {
      button.focus();
      button.click();
    }, 100);

    // Method 3: Dispatch click event
    setTimeout(() => {
      button.dispatchEvent(new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      }));
    }, 200);
  }

  async function handleCNETIDPage() {
    const creds = await getCredentials();
    if (!creds.enabled || !creds.cnetid) {
      log('No credentials or disabled');
      return false;
    }

    // Look for CNETID input using exact selector
    const input = document.querySelector('input[name="identifier"]');

    if (input && !input.value) {
      log('Found CNETID input');
      currentStep = 'cnetid';

      // Ensure overlay is showing
      initOverlay();
      if (overlay) {
        overlay.setStep(1); // Entering credentials
      }

      // Fill the input
      fillInput(input, creds.cnetid);

      // Look for Next button using exact selector
      setTimeout(() => {
        const nextButton = document.querySelector('input[type="submit"][value="Next"]');

        if (nextButton) {
          log('Found Next button');
          clickSubmitButton(nextButton);
        } else {
          log('Next button not found');
        }
      }, 500);

      return true;
    }

    return false;
  }

  async function handlePasswordPage() {
    const creds = await getCredentials();
    if (!creds.enabled || !creds.password) {
      log('No password or disabled');
      return false;
    }

    // Look for password input using exact selector
    const passwordInput = document.querySelector('input[name="credentials.passcode"]') ||
                         document.querySelector('input[type="password"].password-with-toggle');

    if (passwordInput && !passwordInput.value) {
      log('Found password input');
      currentStep = 'password';

      // Ensure overlay is showing
      initOverlay();
      if (overlay) {
        overlay.setStep(2); // Verifying password
      }

      // Fill password
      fillInput(passwordInput, creds.password);

      // Look for Verify button
      setTimeout(() => {
        const verifyButton = document.querySelector('input[type="submit"][value="Verify"]');

        if (verifyButton) {
          log('Found Verify button');
          clickSubmitButton(verifyButton);
        } else {
          log('Verify button not found');
        }
      }, 500);

      return true;
    }

    return false;
  }

  async function handleDuoVerifyPage() {
    const creds = await getCredentials();
    if (!creds.enabled) return false;

    // Check if we're on the Duo verify page
    // Look for Verify button but make sure there's no password field
    const verifyButton = document.querySelector('input[type="submit"][value="Verify"]');
    const hasPasswordField = document.querySelector('input[type="password"]');
    const hasCNETIDField = document.querySelector('input[name="identifier"]');

    // Only click if we have verify button but no password/cnetid fields
    if (verifyButton && !hasPasswordField && !hasCNETIDField) {
      // Check if page mentions Duo
      const pageText = document.body.textContent;
      if (pageText.includes('Duo') || pageText.includes('Two-Factor') || pageText.includes('two-factor')) {
        log('Found Duo Verify button');
        currentStep = 'duo';

        // Update overlay
        if (overlay) {
          overlay.setStep(3); // Connecting to Duo
        }

        setTimeout(() => {
          clickSubmitButton(verifyButton);

          // Update to passkey step after clicking
          if (overlay) {
            setTimeout(() => overlay.setStep(4), 500); // Authenticating with passkey
          }
        }, 1000);

        return true;
      }
    }

    return false;
  }

  async function processPage() {
    attemptCount++;
    if (attemptCount > 20) {
      log('Max attempts reached, stopping');
      return;
    }

    const url = window.location.href;
    log(`Attempt ${attemptCount} - Processing: ${url.substring(0, 60)}...`);

    const creds = await getCredentials();
    if (!creds.enabled) {
      log('Extension disabled');
      return;
    }

    // Try handlers in order
    if (await handleCNETIDPage()) {
      log('Handled CNETID page');
      return;
    }

    if (await handlePasswordPage()) {
      log('Handled password page');
      return;
    }

    if (await handleDuoVerifyPage()) {
      log('Handled Duo verify page');
      return;
    }
  }

  // Initialize when DOM is ready
  function init() {
    log('Initializing okta-handler...');

    // Check if we have an active overlay from previous page
    const activeOverlay = sessionStorage.getItem('uchicago-auth-overlay-active');
    if (activeOverlay === 'true') {
      // Restore overlay immediately
      overlay = new window.AuthOverlay();

      // Detect which page we're on and update accordingly
      detectCurrentPage();
    } else {
      // Check if we're on a login page and create overlay immediately
      getCredentials().then(creds => {
        if (creds.enabled && (creds.cnetid || creds.password)) {
          const hasLoginElements =
            document.querySelector('input[name="identifier"]') ||
            document.querySelector('input[type="password"]');

          if (hasLoginElements) {
            // Create overlay immediately to hide the page
            initOverlay();
            if (overlay) {
              overlay.setStep(0); // Initializing
            }
          }
        }
      });
    }

    // Process immediately
    processPage();

    // Process again after a delay
    setTimeout(processPage, 1000);

    // Set up periodic checking
    const interval = setInterval(() => {
      processPage();
    }, 1500);

    // Stop checking after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      log('Stopped periodic checking');
    }, 30000);
  }

  // Detect current page state
  function detectCurrentPage() {
    const hasPasswordField = document.querySelector('input[type="password"]');
    const hasCNETIDField = document.querySelector('input[name="identifier"]');
    const pageText = document.body.textContent;

    if (hasCNETIDField) {
      log('Detected CNETID page');
      if (overlay) overlay.setStep(1);
    } else if (hasPasswordField) {
      log('Detected password page');
      if (overlay) overlay.setStep(2);
    } else if (pageText.includes('Duo')) {
      log('Detected Duo page');
      if (overlay) overlay.setStep(3);
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also watch for dynamic changes
  const observer = new MutationObserver(() => {
    // Only process if we haven't processed recently
    if (attemptCount < 20) {
      processPage();
    }
  });

  // Start observing once body exists
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } else {
    // Wait for body to exist
    const bodyWatcher = setInterval(() => {
      if (document.body) {
        clearInterval(bodyWatcher);
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    }, 100);
  }

  // Track URL changes
  let lastUrl = location.href;
  setInterval(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      attemptCount = 0; // Reset attempt counter
      currentStep = null;
      log('URL changed, resetting...');
      setTimeout(processPage, 500);
    }
  }, 500);

  // Listen for messages from Duo iframe
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'duo-auth-update') {
      if (overlay) {
        if (event.data.status === 'finalizing') {
          overlay.setStep(5); // Finalizing login
        } else if (event.data.status === 'success') {
          overlay.setStep(6); // Success! Redirecting

          // Remove overlay after success
          setTimeout(() => {
            if (overlay) {
              overlay.destroy();
              overlay = null;
            }
          }, 2000);
        }
      }
    }
  });

  // Also detect when we're redirected away (but not to Duo)
  window.addEventListener('beforeunload', () => {
    // Don't mark as success if we're going to a Duo page
    const nextUrl = document.activeElement?.href || '';
    const isDuoRedirect = nextUrl.includes('duo') || nextUrl.includes('2fa');

    if (overlay && !isDuoRedirect) {
      // Only mark success if we're not going to Duo
      const currentStep = sessionStorage.getItem('uchicago-auth-overlay-step');
      if (currentStep && parseInt(currentStep) >= 5) {
        overlay.setStep(6); // Success
      }
    }
  });

  // Clean up overlay if we end up on a page without auth elements
  setTimeout(() => {
    const hasAuthElements =
      document.querySelector('input[name="identifier"]') ||
      document.querySelector('input[type="password"]') ||
      document.body.textContent.includes('Duo') ||
      document.body.textContent.includes('Sign In') ||
      document.body.textContent.includes('Log In');

    const url = window.location.href;
    const isDuoPage = url.includes('duosecurity.com');

    // Only clean up if we're not on a Duo page and have no auth elements
    if (!hasAuthElements && !isDuoPage && overlay) {
      log('No auth elements found, assuming success - removing overlay');
      if (overlay) {
        overlay.setStep(6); // Success
        setTimeout(() => {
          overlay.destroy();
          overlay = null;
        }, 1500);
      }
    }
  }, 5000);

})();