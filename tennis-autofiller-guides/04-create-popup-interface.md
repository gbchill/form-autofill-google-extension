# Create Popup Interface

## Task
Create the user interface files for the extension popup: `popup.html`, `popup.css`, and `popup.js`.

## Requirements
- Clean, professional interface
- Tabbed layout for Profile and Settings
- Form for user profile configuration
- Toggle switches for settings
- Real-time status updates
- Manual fill button
- Responsive design in 350px width

## File 1: popup.html

Create the HTML structure:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="header">
    <h1>🎾 Tennis Form AutoFiller</h1>
    <div class="subtitle">ASU Tennis Club Registration</div>
  </div>

  <div id="status" class="status"></div>

  <div class="tabs">
    <div class="tab active" data-tab="profile">Profile</div>
    <div class="tab" data-tab="settings">Settings</div>
  </div>

  <!-- Profile Tab -->
  <div id="profile-tab" class="tab-content active">
    <form id="profile-form">
      <div class="form-group">
        <label for="firstName">First Name</label>
        <input type="text" id="firstName" placeholder="John" required>
      </div>

      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" placeholder="Doe" required>
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="john.doe@asu.edu" required>
      </div>

      <div class="form-group">
        <label for="phone">Phone Number</label>
        <input type="tel" id="phone" placeholder="(480) 555-0123">
      </div>

      <div class="form-group">
        <label for="challengeTarget">Challenge Target</label>
        <input type="text" id="challengeTarget" placeholder="Player you want to challenge">
      </div>

      <div class="form-group">
        <label>Available Days</label>
        <div class="checkbox-group">
          <div class="checkbox-item">
            <input type="checkbox" id="monday" value="Monday">
            <label for="monday">Monday</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="tuesday" value="Tuesday">
            <label for="tuesday">Tuesday</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="wednesday" value="Wednesday">
            <label for="wednesday">Wednesday</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="thursday" value="Thursday">
            <label for="thursday">Thursday</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="friday" value="Friday">
            <label for="friday">Friday</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="saturday" value="Saturday">
            <label for="saturday">Saturday</label>
          </div>
          <div class="checkbox-item">
            <input type="checkbox" id="sunday" value="Sunday">
            <label for="sunday">Sunday</label>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="preferredTime">Preferred Time</label>
        <select id="preferredTime">
          <option value="">Select time...</option>
          <option value="Morning">Morning (6 AM - 12 PM)</option>
          <option value="Afternoon">Afternoon (12 PM - 6 PM)</option>
          <option value="Evening">Evening (6 PM - 10 PM)</option>
          <option value="Flexible">Flexible</option>
        </select>
      </div>

      <div class="form-group">
        <label for="notes">Additional Notes</label>
        <textarea id="notes" placeholder="Any additional information..."></textarea>
      </div>

      <button type="submit" class="button primary">Save Profile</button>
    </form>
  </div>

  <!-- Settings Tab -->
  <div id="settings-tab" class="tab-content">
    <div class="toggle-group">
      <label>Auto-Fill Forms</label>
      <label class="toggle">
        <input type="checkbox" id="autoFillEnabled">
        <span class="slider"></span>
      </label>
    </div>

    <div class="toggle-group">
      <label>Auto-Submit Forms</label>
      <label class="toggle">
        <input type="checkbox" id="autoSubmitEnabled">
        <span class="slider"></span>
      </label>
    </div>

    <button id="fillFormBtn" class="button success">Fill Form Now</button>
    <button id="testExtensionBtn" class="button secondary">Test Extension</button>

    <div class="info-text">
      <strong>Auto-Fill:</strong> Automatically fills forms when detected<br>
      <strong>Auto-Submit:</strong> Automatically submits after filling (use with caution)<br>
      <strong>Fill Now:</strong> Manually trigger form filling on current page
    </div>

    <div id="lastFill" class="last-fill"></div>
  </div>

  <script src="popup.js"></script>
</body>
</html>
```

## File 2: popup.css

Create the styling:

```css
body {
  width: 350px;
  min-height: 400px;
  padding: 16px;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8f9fa;
}

.header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e9ecef;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  font-weight: 600;
}

.header .subtitle {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

.status {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  font-weight: 500;
}

.status.ready {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status.warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.tabs {
  display: flex;
  margin-bottom: 16px;
  background: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tab {
  flex: 1;
  padding: 8px 12px;
  text-align: center;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tab.active {
  background: #007bff;
  color: white;
}

.tab:not(.active) {
  color: #6c757d;
}

.tab:not(.active):hover {
  background: #f8f9fa;
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 13px;
  color: #495057;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 13px;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.checkbox-item input {
  width: auto;
  margin-right: 6px;
}

.button {
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.button.primary {
  background: #007bff;
  color: white;
}

.button.primary:hover {
  background: #0056b3;
}

.button.secondary {
  background: #6c757d;
  color: white;
}

.button.secondary:hover {
  background: #545b62;
}

.button.success {
  background: #28a745;
  color: white;
}

.button.success:hover {
  background: #1e7e34;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toggle-group label {
  font-size: 13px;
  font-weight: 500;
  color: #495057;
  margin: 0;
}

.toggle {
  position: relative;
  width: 44px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #007bff;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.info-text {
  font-size: 11px;
  color: #6c757d;
  margin-top: 8px;
  line-height: 1.4;
}

.last-fill {
  font-size: 11px;
  color: #6c757d;
  text-align: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
}
```

## File 3: popup.js

Create the JavaScript functionality:

```javascript
// Tennis Form AutoFiller - Popup Script
document.addEventListener('DOMContentLoaded', function() {
  // Initialize popup
  loadUserProfile();
  loadSettings();
  updateStatus();
  setupEventListeners();
  updateLastFillTime();

  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
});

function setupEventListeners() {
  // Profile form submission
  document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveUserProfile();
  });

  // Settings toggles
  document.getElementById('autoFillEnabled').addEventListener('change', function() {
    chrome.storage.sync.set({ autoFillEnabled: this.checked });
    updateStatus();
  });

  document.getElementById('autoSubmitEnabled').addEventListener('change', function() {
    chrome.storage.sync.set({ autoSubmitEnabled: this.checked });
  });

  // Action buttons
  document.getElementById('fillFormBtn').addEventListener('click', function() {
    fillFormNow();
  });

  document.getElementById('testExtensionBtn').addEventListener('click', function() {
    testExtension();
  });
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

function loadUserProfile() {
  chrome.storage.sync.get(['userProfile'], function(result) {
    if (result.userProfile) {
      const profile = result.userProfile;
      
      // Fill form fields
      document.getElementById('firstName').value = profile.firstName || '';
      document.getElementById('lastName').value = profile.lastName || '';
      document.getElementById('email').value = profile.email || '';
      document.getElementById('phone').value = profile.phone || '';
      document.getElementById('challengeTarget').value = profile.challengeTarget || '';
      document.getElementById('preferredTime').value = profile.preferredTime || '';
      document.getElementById('notes').value = profile.notes || '';

      // Set available days checkboxes
      if (profile.availableDays) {
        profile.availableDays.forEach(day => {
          const checkbox = document.getElementById(day.toLowerCase());
          if (checkbox) {
            checkbox.checked = true;
          }
        });
      }
    }
  });
}

function saveUserProfile() {
  // Get available days
  const availableDays = [];
  document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(checkbox => {
    availableDays.push(checkbox.value);
  });

  const profile = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    fullName: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    challengeTarget: document.getElementById('challengeTarget').value,
    availableDays: availableDays,
    preferredTime: document.getElementById('preferredTime').value,
    notes: document.getElementById('notes').value
  };

  chrome.storage.sync.set({ userProfile: profile }, function() {
    // Show success message
    showStatus('Profile saved successfully!', 'ready');
    updateStatus();
  });
}

function loadSettings() {
  chrome.storage.sync.get(['autoFillEnabled', 'autoSubmitEnabled'], function(result) {
    document.getElementById('autoFillEnabled').checked = result.autoFillEnabled !== false; // Default true
    document.getElementById('autoSubmitEnabled').checked = result.autoSubmitEnabled || false; // Default false
  });
}

function updateStatus() {
  chrome.storage.sync.get(['userProfile', 'autoFillEnabled'], function(result) {
    const statusEl = document.getElementById('status');
    
    if (!result.userProfile || !result.userProfile.firstName) {
      showStatus('⚠️ Please set up your profile first', 'warning');
      return;
    }

    // Check if we're on a Google Form
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('docs.google.com/forms/')) {
        if (result.autoFillEnabled !== false) {
          showStatus('✅ Ready to auto-fill forms', 'ready');
        } else {
          showStatus('⏸️ Auto-fill disabled', 'warning');
        }
        
        // Enable fill button
        document.getElementById('fillFormBtn').disabled = false;
      } else {
        showStatus('ℹ️ Navigate to a Google Form to use auto-fill', 'warning');
        document.getElementById('fillFormBtn').disabled = true;
      }
    });
  });
}

function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function fillFormNow() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'fillForm' }, function(response) {
      if (chrome.runtime.lastError) {
        showStatus('❌ Error: Please refresh the page and try again', 'error');
      } else if (response && response.success) {
        showStatus('✅ Form filled successfully!', 'ready');
        updateLastFillTime();
      } else {
        showStatus('❌ No form found or unable to fill', 'error');
      }
    });
  });
}

function testExtension() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'checkFormStatus' }, function(response) {
      if (chrome.runtime.lastError) {
        showStatus('❌ Extension not loaded. Refresh the page.', 'error');
      } else if (response) {
        const isForm = response.isGoogleForm;
        const fieldCount = response.formFields;
        
        if (isForm) {
          showStatus(`✅ Google Form detected with ${fieldCount} fields`, 'ready');
        } else {
          showStatus('ℹ️ Not a Google Form page', 'warning');
        }
      } else {
        showStatus('❌ No response from content script', 'error');
      }
    });
  });
}

function updateLastFillTime() {
  chrome.storage.sync.get(['lastFillTime'], function(result) {
    const lastFillEl = document.getElementById('lastFill');
    if (result.lastFillTime) {
      const date = new Date(result.lastFillTime);
      lastFillEl.textContent = `Last filled: ${date.toLocaleString()}`;
    } else {
      lastFillEl.textContent = 'No forms filled yet';
    }
  });
}

// Auto-refresh status every 2 seconds
setInterval(updateStatus, 2000);
```

## Key Features
- **Tabbed Interface**: Clean separation of profile and settings
- **Real-time Status**: Live updates on extension state
- **Form Validation**: Required fields and proper input types
- **Visual Feedback**: Color-coded status messages
- **Responsive Design**: Works within Chrome's popup constraints
- **Auto-refresh**: Status updates automatically
- **Professional Styling**: Modern, clean appearance

## Testing Points
1. Tab switching functionality
2. Profile saving/loading
3. Settings persistence
4. Status updates
5. Button interactions
6. Form validation