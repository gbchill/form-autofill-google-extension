# Create Extension Manifest

## Task
Create the `manifest.json` file that defines the Chrome extension configuration, permissions, and entry points.

## Requirements
- Use Manifest V3 (latest Chrome extension format)
- Minimal permissions for security (only storage and activeTab)
- Content script injection on Google Forms pages
- Popup interface for user configuration
- Background service worker for extension lifecycle management

## File: manifest.json

Create this file with the following specifications:

```json
{
  "manifest_version": 3,
  "name": "Tennis Form AutoFiller",
  "version": "1.0.0",
  "description": "Automatically fills tennis club challenge match registration forms",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "content_scripts": [
    {
      "matches": ["https://docs.google.com/forms/*"],
      "js": ["content-script.js"],
      "run_at": "document_start"
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "Tennis Form AutoFiller",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self';"
  }
}
```

## Key Features
- **Permissions**: Minimal security footprint with only necessary permissions
- **Content Script**: Injected at `document_start` for maximum speed
- **URL Matching**: Specifically targets Google Forms URLs
- **Popup Action**: Click extension icon to configure settings
- **Service Worker**: Background processing for extension lifecycle
- **CSP**: Content Security Policy for enhanced security

## Validation
After creating the file:
1. Check JSON syntax is valid
2. Ensure all referenced files will be created
3. Verify permissions are minimal but sufficient
4. Confirm URL patterns match target Google Forms