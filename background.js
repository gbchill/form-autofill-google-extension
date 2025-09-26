// Tennis Form AutoFiller - Background Service Worker

chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    console.log('Tennis Form AutoFiller installed');
    
    // Set default settings
    chrome.storage.sync.set({
      autoFillEnabled: true,
      autoSubmitEnabled: false
    });
    
    // Don't auto-open popup on install to avoid tab issues
    console.log('Extension installed successfully');
  } else if (details.reason === 'update') {
    console.log('Tennis Form AutoFiller updated');
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(function(tab) {
  // This will open the popup, which is handled by the manifest
  console.log('Extension icon clicked');
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'logFormFill') {
    console.log('Form filled successfully:', request.data);
    
    // Safely update badge with error handling
    if (sender.tab && sender.tab.id) {
      chrome.tabs.get(sender.tab.id, function(tab) {
        if (chrome.runtime.lastError) {
          console.log('Tab no longer exists, skipping badge update');
          return;
        }
        
        chrome.action.setBadgeText({
          text: '✓',
          tabId: sender.tab.id
        }).catch(() => {
          console.log('Failed to set badge text');
        });
        
        chrome.action.setBadgeBackgroundColor({
          color: '#28a745'
        }).catch(() => {
          console.log('Failed to set badge color');
        });
        
        // Clear badge after 3 seconds
        setTimeout(() => {
          chrome.tabs.get(sender.tab.id, function(tab) {
            if (!chrome.runtime.lastError) {
              chrome.action.setBadgeText({
                text: '',
                tabId: sender.tab.id
              }).catch(() => {
                console.log('Failed to clear badge');
              });
            }
          });
        }, 3000);
      });
    }
    
    sendResponse({ success: true });
  }
});

// Update badge when navigating to Google Forms
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('docs.google.com/forms/')) {
      // Check if auto-fill is enabled
      chrome.storage.sync.get(['autoFillEnabled'], function(result) {
        if (result.autoFillEnabled !== false) {
          // Verify tab still exists before setting badge
          chrome.tabs.get(tabId, function(tab) {
            if (chrome.runtime.lastError) {
              console.log('Tab no longer exists, skipping badge update');
              return;
            }
            
            chrome.action.setBadgeText({
              text: '⚡',
              tabId: tabId
            }).catch(() => {
              console.log('Failed to set lightning badge');
            });
            
            chrome.action.setBadgeBackgroundColor({
              color: '#007bff'
            }).catch(() => {
              console.log('Failed to set badge background color');
            });
          });
        }
      });
    } else {
      // Clear badge for non-form pages
      chrome.tabs.get(tabId, function(tab) {
        if (!chrome.runtime.lastError) {
          chrome.action.setBadgeText({
            text: '',
            tabId: tabId
          }).catch(() => {
            console.log('Failed to clear badge on non-form page');
          });
        }
      });
    }
  }
});

// Clear badge when tab is closed - no need to check if tab exists
chrome.tabs.onRemoved.addListener(function(tabId) {
  // Tab is already removed, so we just log this
  console.log('Tab removed:', tabId);
});