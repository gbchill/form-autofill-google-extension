//Form AutoFiller - Popup Script
document.addEventListener('DOMContentLoaded', function() {
  // Initialize popup
  loadUserProfile();
  loadSettings();
  updateStatus();
  setupEventListeners();
  updateLastFillTime();
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


function loadUserProfile() {
  chrome.storage.sync.get(['userProfile'], function(result) {
    if (result.userProfile) {
      const profile = result.userProfile;
      
      // Fill form fields
      document.getElementById('fullName').value = profile.fullName || '';
      document.getElementById('challengeTarget').value = profile.challengeTarget || '';
      document.getElementById('partnerName').value = profile.partnerName || '';
      document.getElementById('challengeType').value = profile.challengeType || '';

      // Set practice days checkboxes
      if (profile.practiceDays) {
        profile.practiceDays.forEach(day => {
          const checkbox = document.getElementById(`practice-${day.toLowerCase()}`);
          if (checkbox) {
            checkbox.checked = true;
          }
        });
      }
      
      // Set challenge days checkboxes
      if (profile.challengeDays) {
        profile.challengeDays.forEach(day => {
          const checkbox = document.getElementById(`challenge-${day.toLowerCase()}`);
          if (checkbox) {
            checkbox.checked = true;
          }
        });
      }
    }
  });
}

function saveUserProfile() {
  // Get practice days
  const practiceDays = [];
  document.querySelectorAll('input[id^="practice-"]:checked').forEach(checkbox => {
    practiceDays.push(checkbox.value);
  });
  
  // Get challenge days
  const challengeDays = [];
  document.querySelectorAll('input[id^="challenge-"]:checked').forEach(checkbox => {
    challengeDays.push(checkbox.value);
  });

  const profile = {
    fullName: document.getElementById('fullName').value,
    challengeTarget: document.getElementById('challengeTarget').value,
    partnerName: document.getElementById('partnerName').value,
    challengeType: document.getElementById('challengeType').value,
    practiceDays: practiceDays,
    challengeDays: challengeDays
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
    
    if (!result.userProfile || !result.userProfile.fullName) {
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