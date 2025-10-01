# Privacy Policy for Form AutoFiller

**Last Updated:** October 1, 2025

## Introduction

Form AutoFiller is a Chrome browser extension designed to automatically fill out Google Forms with your saved profile information. This privacy policy explains how we handle your data.

## Data Collection and Storage

### What Data We Store
Form AutoFiller stores the following information locally on your device using Chrome's Sync Storage:

- **User Profile Information:**
  - Full name
  - Practice day preferences
  - Challenge day preferences
  - Challenge type preference
  - Challenge target name
  - Partner name

- **Extension Settings:**
  - Auto-fill enabled/disabled status
  - Auto-submit enabled/disabled status
  - Last form fill timestamp

### Where Data is Stored
All data is stored locally using Chrome's built-in `chrome.storage.sync` API. This means:
- Data is stored on your device
- Data syncs across your Chrome browsers when you're signed into Chrome
- **We do not have access to your data**
- **We do not send your data to any external servers**
- **We do not collect, transmit, or sell any user data**

## Data Usage

The extension uses your stored profile information solely to:
- Automatically fill form fields on Google Forms pages
- Provide you with control over auto-fill and auto-submit features
- Display your last fill timestamp

## Permissions

The extension requires the following permissions:

- **storage**: To save your profile and settings locally
- **activeTab**: To interact with Google Forms pages when you're actively using them

We only access the current tab when you're on a Google Forms page, and only to fill out forms based on your saved profile.

## Data Security

- All data remains on your device and within Chrome's sync ecosystem
- We do not transmit data to external servers
- Chrome's sync uses encryption to protect your synced data

## Third-Party Services

Form AutoFiller does not use any third-party services, analytics, or tracking.

## Changes to Form Fields

The extension only modifies form fields on Google Forms pages (docs.google.com/forms/*) and only when:
- You have auto-fill enabled, OR
- You manually click the "Fill Form Now" button

## Your Rights

You can:
- Delete all stored data by removing the extension
- Clear your profile at any time through the extension popup
- Disable auto-fill and auto-submit features at any time

## Children's Privacy

This extension does not knowingly collect information from children under 13. The extension is designed for general form-filling purposes and does not target children.

## Changes to This Policy

We may update this privacy policy from time to time. Any changes will be reflected in the "Last Updated" date at the top of this policy.

## Contact

If you have questions about this privacy policy, please create an issue on our GitHub repository:
https://github.com/[your-username]/form-autofiller

## Open Source

This extension is open source. You can review the complete source code to verify our privacy practices at:
https://github.com/[your-username]/form-autofiller
