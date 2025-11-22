(async function() {
  let deviceTrustClicked = false;
  let overlay = null;

  function log(msg) {
    console.log(`[UChicago Auto-Auth Duo] ${msg}`);
  }

  async function isEnabled() {
    return new Promise(resolve => {
      chrome.storage.local.get(['enabled', 'autoTrust'], result => {
        resolve({
          enabled: result.enabled !== false,
          autoTrust: result.autoTrust !== false
        });
      });
    });
  }

  async function handleDeviceTrust() {
    if (deviceTrustClicked) return;

    const settings = await isEnabled();
    if (!settings.enabled || !settings.autoTrust) {
      log('Auto-auth or auto-trust disabled');
      return;
    }

    // Look for the exact button using ID
    const trustButton = document.querySelector('#trust-browser-button') ||
                       Array.from(document.querySelectorAll('button.button--primary')).find(btn =>
                         btn.textContent.includes('Yes, this is my device')
                       ) ||
                       Array.from(document.querySelectorAll('button')).find(btn =>
                         btn.textContent.includes('Yes, this is my device')
                       );

    if (trustButton) {
      log('Found device trust button, clicking...');
      deviceTrustClicked = true;

      // Wait a moment then click
      setTimeout(() => {
        trustButton.click();
        log('Clicked "Yes, this is my device"');

        // Update overlay if we have one
        if (overlay) {
          overlay.setStep(5); // Finalizing login
        }

        // Also send message to parent window if in iframe
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'duo-auth-update',
            status: 'finalizing'
          }, '*');
        }

        // Backup click
        setTimeout(() => {
          trustButton.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          }));

          // Update overlay if we have one
          if (overlay) {
            setTimeout(() => {
              overlay.setStep(6); // Success
            }, 500);
          }

          // Also send success message to parent if in iframe
          if (window.parent !== window) {
            setTimeout(() => {
              window.parent.postMessage({
                type: 'duo-auth-update',
                status: 'success'
              }, '*');
            }, 500);
          }
        }, 200);
      }, 1000);
    }
  }

  function checkForDeviceTrustPrompt() {
    const url = window.location.href;
    log(`Checking URL: ${url}`);

    // Check if we're on the device trust page
    if (url.includes('/auth/prompt') || url.includes('device')) {
      log('Device trust URL pattern detected');
      handleDeviceTrust();
      return;
    }

    // Also check page content
    const pageText = document.body ? document.body.textContent : '';
    if (pageText.includes('Is this your device') ||
        pageText.includes('Yes, this is my device') ||
        pageText.includes('trust this browser')) {
      log('Device trust content detected');
      handleDeviceTrust();
    }

    // Check for passkey prompt or success indicators
    if (pageText.includes('passkey') || pageText.includes('Passkey') ||
        pageText.includes('Security key') || pageText.includes('security key')) {
      log('Passkey authentication detected');
      if (overlay) {
        overlay.setStep(4); // Authenticating with passkey
      }
    }

    // Check for success/completion
    if (url.includes('success') || url.includes('complete') ||
        pageText.includes('Successfully authenticated')) {
      log('Authentication success detected');
      if (overlay) {
        overlay.setStep(6); // Success
        setTimeout(() => {
          overlay.destroy();
        }, 2000);
      }
    }
  }

  // Initialize
  function init() {
    log('Duo handler initialized on: ' + window.location.href);

    // Always try to create overlay on Duo pages
    const url = window.location.href;
    if (url.includes('duosecurity.com')) {
      log('On Duo page, creating overlay...');

      // Wait for AuthOverlay to be available
      if (window.AuthOverlay) {
        overlay = new window.AuthOverlay();
        overlay.create();
        overlay.setStep(4); // Authenticating with passkey
        log('Overlay created successfully');
      } else {
        log('AuthOverlay not available, retrying...');
        // Retry after a short delay
        setTimeout(() => {
          if (window.AuthOverlay) {
            overlay = new window.AuthOverlay();
            overlay.create();
            overlay.setStep(4); // Authenticating with passkey
            log('Overlay created on retry');
          }
        }, 100);
      }
    }

    // Check immediately
    checkForDeviceTrustPrompt();

    // Check periodically
    const interval = setInterval(() => {
      checkForDeviceTrustPrompt();
    }, 1000);

    // Stop after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      log('Stopped checking for device trust');
    }, 30000);
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Watch for dynamic content and maintain overlay
  const observer = new MutationObserver((mutations) => {
    // Check if the trust button appeared
    const trustButton = document.querySelector('#trust-browser-button');
    if (trustButton && !deviceTrustClicked) {
      log('Trust button appeared via mutation');
      handleDeviceTrust();
    }

    // Check if overlay disappeared
    if (!document.getElementById('uchicago-auth-overlay') && window.location.href.includes('duosecurity.com')) {
      // Only recreate if we don't have one or it's been removed
      if (!overlay || !overlay.overlay) {
        log('Overlay missing after DOM mutation, recreating...');
        if (window.AuthOverlay) {
          overlay = new window.AuthOverlay();
          overlay.create();
          overlay.setStep(4); // Authenticating with passkey
        }
      }
    }
  });

  // Start observing when body exists
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } else {
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

  // Track URL changes and maintain overlay
  let lastUrl = location.href;
  setInterval(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      deviceTrustClicked = false; // Reset for new page
      log(`URL changed to: ${url}`);

      // Recreate overlay if it disappeared
      if (!overlay || !document.getElementById('uchicago-auth-overlay')) {
        log('Overlay disappeared after URL change, recreating...');
        if (window.AuthOverlay) {
          overlay = new window.AuthOverlay();
          overlay.create();

          // Determine appropriate step based on URL or content
          if (url.includes('/frame/v4/auth/prompt')) {
            overlay.setStep(4); // Authenticating with passkey
          } else if (document.body.textContent.includes('device')) {
            overlay.setStep(5); // Finalizing
          } else {
            overlay.setStep(4); // Default to passkey step
          }
        }
      }

      setTimeout(checkForDeviceTrustPrompt, 500);
    }
  }, 250);  // Check more frequently

})();