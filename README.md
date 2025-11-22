# UChicago Auto-Auth Browser Extension

**Complete hands-free authentication for UChicago services** - from CNETID to final login in seconds!

Available for both **Chrome** and **Firefox**!

## 🎯 What It Does

This extension automates the ENTIRE UChicago login process:

1. ✅ Auto-fills and submits your CNETID
2. ✅ Auto-fills and submits your password
3. ✅ Auto-clicks "Verify" for Duo
4. ✅ Lets passkey authenticate automatically
5. ✅ Auto-clicks "Yes, this is my device"
6. ✅ Beautiful full-screen overlay hides the entire process
7. ✅ You're logged in - completely hands-free!

## 🚀 Installation

### Chrome Installation

1. **Download the Extension**:
   - [⬇️ Download uchicago-auto-auth.zip](https://github.com/cvltist/uchicago-auto-auth/releases/download/v0.1/uchicago-auto-auth.zip)
   - Extract the ZIP file to a folder on your computer

2. **Add to Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Toggle ON "Developer mode" (switch in top-right corner)
   - Click "Load unpacked" button
   - Browse to and select the extracted `chrome` folder
   - The extension icon should appear in your toolbar!

### Firefox Installation

1. **Download the Extension**:
   - [⬇️ Download uchicago-auto-auth.zip](https://github.com/cvltist/uchicago-auto-auth/releases/download/v0.1/uchicago-auto-auth.zip)
   - Extract the ZIP file to a folder on your computer

2. **Add to Firefox**:
   - Open Firefox and go to `about:debugging`
   - Click "This Firefox" on the left sidebar
   - Click "Load Temporary Add-on" button
   - Browse to the `firefox` folder and select `manifest.json`
   - The extension will be loaded!

   **Note**: For permanent installation in Firefox, the extension needs to be signed by Mozilla. The temporary installation will last until Firefox restarts.

### Initial Setup (Both Browsers)

1. Click the extension icon (puzzle piece icon → UChicago Auto-Auth)
2. Follow the 3-step welcome wizard:
   - Step 1: Enter your CNETID
   - Step 2: Enter your password
   - Step 3: Confirm and save
3. That's it! The extension is now ready to use

## 📂 Project Structure

```
uchicago-auto-auth/
├── README.md              # This file
├── chrome/               # Chrome extension
│   ├── manifest.json     # Chrome manifest (v3)
│   ├── popup.html
│   ├── options.html
│   ├── welcome.html
│   ├── browser-polyfill.js
│   ├── js/
│   ├── css/
│   └── icons/
└── firefox/              # Firefox extension
    ├── manifest.json     # Firefox manifest (v2)
    ├── popup.html
    ├── options.html
    ├── welcome.html
    ├── browser-polyfill.js  # Mozilla WebExtension polyfill
    ├── js/
    ├── css/
    └── icons/
```

## 🔧 Setup

### Prerequisites
- **You must have a passkey already registered with Duo** (one-time setup through Duo's interface)
- Chrome or Firefox browser with passkey/WebAuthn support

### Configuration
1. Click the extension icon in your browser toolbar
2. If first run, follow the 3-step welcome wizard
3. Or click "Settings" to configure:
   - Enter your CNETID
   - Enter your password
   - Click "Save Credentials"
4. Settings are enabled by default

## 🎮 Usage

Just navigate to any UChicago service that requires login:
- `my.uchicago.edu`
- `courses.uchicago.edu`
- Any other UChicago authenticated service

The extension will handle everything automatically!

## 🔐 Security

### How Credentials Are Stored
- Credentials are stored **locally** in your browser's storage
- They are **never** sent to external servers
- Only used on official UChicago/Okta/Duo domains

### Security Recommendations
- ⚠️ **Only use on your personal, secure device**
- ⚠️ **Never use on shared or public computers**
- Enable screen lock on your device
- Use browser profile lock if available
- Clear credentials when not needed

## 🛠️ Troubleshooting

### Nothing happens when I visit a login page
1. Check that the extension is enabled (click icon, toggle should be ON)
2. Verify credentials are saved (should show in popup)
3. Make sure you're on a supported domain

### Login fails at password step
- Double-check your password is correct
- Try clearing and re-entering credentials

### Passkey step fails
- Ensure you have a passkey registered with Duo
- Try manual passkey login first to verify it works

### Firefox-specific issues
- If the extension stops working after Firefox restart, reload it via `about:debugging`
- For permanent installation, the extension needs Mozilla signing

## 🔄 Authentication Flow

The extension handles this complete flow:

```
1. Navigate to UChicago service
   ↓
2. Beautiful maroon overlay appears with progress indicator
   ↓
3. [AUTO] Enter CNETID → Click "Next"
   ↓
4. [AUTO] Enter Password → Click "Verify"
   ↓
5. [AUTO] Click "Verify" for Duo
   ↓
6. [AUTO] Passkey authenticates (browser handles)
   ↓
7. [AUTO] Click "Yes, this is my device"
   ↓
8. Success animation → Logged in!
```

The entire process is hidden behind a sleek loading screen showing:
- UChicago shield logo
- Current authentication step
- Progress bar with percentage
- Smooth animations

## ⚡ Tips for Maximum Speed

1. **Ensure passkey doesn't require interaction**: Configure your passkey to not require PIN/biometric if possible
2. **Keep extension enabled**: Toggle stays on between sessions
3. **Browser profile**: Use a dedicated browser profile for UChicago work

## 🚨 Important Notes

- This extension stores your password in plain text locally
- It's designed for convenience on personal devices
- Always follow your organization's security policies
- The extension only activates on official UChicago/Okta/Duo domains

## ✨ Features

- **Loading Overlay**: Hides the entire authentication process behind a professional maroon-themed loading screen
- **Welcome Wizard**: Easy 3-step setup process for first-time users
- **Persistent State**: Overlay persists across page navigations and Duo transitions
- **Smart Detection**: Automatically detects which authentication step you're on
- **Visual Feedback**: Progress bar and status messages keep you informed
- **Auto-Trust Device**: Automatically clicks "Yes, this is my device" to remember your browser
- **Cross-Browser**: Works on both Chrome and Firefox

## ⚖️ Disclaimer

This is an **unofficial** tool not affiliated with or endorsed by:
- University of Chicago
- Duo Security
- Okta

Use at your own risk and in compliance with your organization's security policies. The developers are not responsible for any security issues that may arise from using this extension.

## 🙏 Acknowledgments

Me, I did everything. Developed to save UChicago students countless hours of authentication time.

## 📝 License

MIT License - For educational use by UChicago students

---

**Remember**: With great power comes great responsibility. This extension bypasses multiple security prompts, so ensure your device is secure!