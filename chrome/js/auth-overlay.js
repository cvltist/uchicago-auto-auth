// Create and manage the authentication overlay
class AuthOverlay {
  constructor() {
    this.overlay = null;
    this.progressBar = null;
    this.statusText = null;
    this.currentStep = 0;
    this.steps = [
      'Initializing authentication...',
      'Entering credentials...',
      'Verifying password...',
      'Connecting to Duo...',
      'Authenticating with passkey...',
      'Finalizing login...',
      'Success! Redirecting...'
    ];

    // Load saved state from session storage
    this.loadState();
  }

  saveState() {
    sessionStorage.setItem('uchicago-auth-overlay-step', this.currentStep.toString());
    sessionStorage.setItem('uchicago-auth-overlay-active', 'true');
  }

  loadState() {
    const savedStep = sessionStorage.getItem('uchicago-auth-overlay-step');
    const isActive = sessionStorage.getItem('uchicago-auth-overlay-active');

    if (isActive === 'true' && savedStep !== null) {
      this.currentStep = parseInt(savedStep);
      // Auto-create overlay if it was previously active
      setTimeout(() => {
        this.create();
        this.updateProgress();
      }, 100);
    }

    // Also check if we're on a Duo page
    if (window.location.href.includes('duosecurity.com')) {
      console.log('[AuthOverlay] Detected Duo page, auto-creating overlay');
      setTimeout(() => {
        if (!this.overlay) {
          this.create();
          this.setStep(4); // Authenticating with passkey
        }
      }, 50);
    }
  }

  clearState() {
    sessionStorage.removeItem('uchicago-auth-overlay-step');
    sessionStorage.removeItem('uchicago-auth-overlay-active');
  }

  create() {
    // Don't create if already exists
    if (this.overlay) return;

    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'uchicago-auth-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #800000 0%, #4a0000 100%);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: fadeIn 0.3s ease;
      pointer-events: none;
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @keyframes slideRight {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);

    // Create content container
    const content = document.createElement('div');
    content.style.cssText = `
      text-align: center;
      max-width: 500px;
      padding: 40px;
    `;

    // Create logo
    const logo = document.createElement('div');
    logo.style.cssText = `
      width: 100px;
      height: 100px;
      margin: 0 auto 30px;
      background: white;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    `;

    // Create shield icon inside logo
    const shield = document.createElement('div');
    shield.style.cssText = `
      width: 50px;
      height: 60px;
      background: #800000;
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    `;
    logo.appendChild(shield);

    // Create title
    const title = document.createElement('h1');
    title.textContent = 'UChicago Auto-Auth';
    title.style.cssText = `
      color: white;
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 10px;
    `;

    // Create status text
    this.statusText = document.createElement('p');
    this.statusText.textContent = this.steps[0];
    this.statusText.style.cssText = `
      color: rgba(255, 255, 255, 0.9);
      font-size: 18px;
      margin-bottom: 40px;
      min-height: 30px;
      animation: pulse 2s infinite;
    `;

    // Create progress container
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 20px;
    `;

    // Create progress bar
    this.progressBar = document.createElement('div');
    this.progressBar.style.cssText = `
      width: 0%;
      height: 100%;
      background: white;
      border-radius: 10px;
      transition: width 0.5s ease;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    `;
    progressContainer.appendChild(this.progressBar);

    // Create percentage text
    this.percentageText = document.createElement('p');
    this.percentageText.textContent = '0%';
    this.percentageText.style.cssText = `
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      font-weight: 500;
    `;

    // Create spinner
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 40px;
      height: 40px;
      margin: 30px auto 0;
      border: 3px solid rgba(255, 255, 255, 0.2);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    // Add spinner animation
    const spinnerStyle = document.createElement('style');
    spinnerStyle.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(spinnerStyle);

    // Assemble content
    content.appendChild(logo);
    content.appendChild(title);
    content.appendChild(this.statusText);
    content.appendChild(progressContainer);
    content.appendChild(this.percentageText);
    content.appendChild(spinner);

    // Add content to overlay
    this.overlay.appendChild(content);

    // Add to page
    document.body.appendChild(this.overlay);
  }

  updateProgress(step, customText = null) {
    if (!this.overlay) this.create();

    // Update step
    if (step !== undefined) {
      this.currentStep = step;
      this.saveState(); // Save state on each update
    }

    // Calculate progress
    const progress = Math.min(100, ((this.currentStep + 1) / this.steps.length) * 100);

    // Update progress bar
    if (this.progressBar) {
      this.progressBar.style.width = progress + '%';
    }
    if (this.percentageText) {
      this.percentageText.textContent = Math.round(progress) + '%';
    }

    // Update status text
    if (this.statusText) {
      if (customText) {
        this.statusText.textContent = customText;
      } else if (this.currentStep < this.steps.length) {
        this.statusText.textContent = this.steps[this.currentStep];
      }
    }

    // Add success animation on completion
    if (progress === 100) {
      if (this.statusText) this.statusText.style.color = '#48bb78';
      if (this.progressBar) this.progressBar.style.background = '#48bb78';
    }
  }

  setStep(stepIndex) {
    this.currentStep = stepIndex;
    this.updateProgress();
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.updateProgress();
    }
  }

  destroy() {
    if (this.overlay) {
      // Clear saved state
      this.clearState();

      // Fade out animation
      this.overlay.style.opacity = '0';
      this.overlay.style.transition = 'opacity 0.3s ease';

      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
        }
        this.overlay = null;
        this.progressBar = null;
        this.statusText = null;
      }, 300);
    }
  }

  // Quick status updates
  setStatus(text) {
    if (this.statusText) {
      this.statusText.textContent = text;
    }
  }

  setError(text) {
    if (this.statusText) {
      this.statusText.textContent = text;
      this.statusText.style.color = '#f56565';
    }
  }
}

// Export for use in other scripts
window.AuthOverlay = AuthOverlay;

// Auto-create on Duo pages
if (window.location.href.includes('duosecurity.com')) {
  console.log('[AuthOverlay] Auto-initializing for Duo page');
  const autoOverlay = new AuthOverlay();
  autoOverlay.create();
  autoOverlay.setStep(4); // Authenticating with passkey

  // Store reference globally for persistence
  window.__uchicagoAuthOverlay = autoOverlay;
}

// Monitor for overlay removal and recreate if needed
if (window.location.href.includes('duosecurity.com')) {
  setInterval(() => {
    if (!document.getElementById('uchicago-auth-overlay') && window.__uchicagoAuthOverlay) {
      console.log('[AuthOverlay] Overlay was removed, recreating...');
      window.__uchicagoAuthOverlay.create();
    }
  }, 500);
}