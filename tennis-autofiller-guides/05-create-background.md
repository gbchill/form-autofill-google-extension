# Create Background Service Worker

## Task
Create the `background.js` file that handles extension lifecycle, installation, and communication between components.

## Requirements
- Manifest V3 service worker compliance
- Handle extension installation and updates
- Manage extension badges and notifications
- Set up default settings
- Monitor tab changes for Google Forms
- Provide extension state management

## File: background.js

Create the service worker with comprehensive lifecycle management:

```javascript
// Tennis Form AutoFiller - Background Service Worker

chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    console.log('Tennis Form AutoFiller installed');
    
    // Set default settings
    chrome.storage.sync.set({
      autoFillEnabled: true,
      autoSubmitEnabled: false
    });
    
    // Open welcome page or setup
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup.html')
    });
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
    
    // Update badge to show last fill time
    chrome.action.setBadgeText({
      text: '✓',
      tabId: sender.tab.id
    });
    
    chrome.action.setBadgeBackgroundColor({
      color: '#28a745'
    });
    
    // Clear badge after 3 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({
        text: '',
        tabId: sender.tab.id
      });
    }, 3000);
    
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
          chrome.action.setBadgeText({
            text: '⚡',
            tabId: tabId
          });
          
          chrome.action.setBadgeBackgroundColor({
            color: '#007bff'
          });
        }
      });
    } else {
      // Clear badge for non-form pages
      chrome.action.setBadgeText({
        text: '',
        tabId: tabId
      });
    }
  }
});

// Clear badge when tab is closed
chrome.tabs.onRemoved.addListener(function(tabId) {
  chrome.action.setBadgeText({
    text: '',
    tabId: tabId
  });
});
```

## Key Features
- **Installation Handling**: Sets up default settings on first install
- **Badge Management**: Visual indicators for Google Forms pages
- **Message Handling**: Communication hub for extension components
- **Tab Monitoring**: Automatic detection of Google Forms navigation
- **Lifecycle Management**: Proper cleanup and state management

## Functionality
1. **Installation**: Welcome setup and default settings
2. **Updates**: Handle version updates gracefully
3. **Badge System**: Visual feedback on extension icon
4. **Tab Monitoring**: Detect when user navigates to Google Forms
5. **Message Routing**: Central communication hub
6. **State Management**: Maintain extension state across sessions

## Testing Points
1. Extension installation behavior
2. Badge appearance on Google Forms
3. Badge clearing on navigation
4. Message passing functionality
5. Default settings initialization
6. Update handling