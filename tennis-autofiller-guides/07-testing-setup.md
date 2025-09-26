# Testing and Setup Guide

## Task
Complete setup of the Tennis Form AutoFiller extension and comprehensive testing with Google Forms.

## Prerequisites Checklist
- [ ] All files created (manifest.json, content-script.js, popup.html, popup.js, popup.css, background.js)
- [ ] Icons folder created with 3 PNG files
- [ ] VS Code open with project folder
- [ ] Chrome browser available

## Step 1: Load Extension in Chrome

### Enable Developer Mode:
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Toggle "Developer mode" ON (top right)

### Load Your Extension:
1. Click "Load unpacked" button
2. Navigate to your `tennis-form-autofiller` folder
3. Select the folder and click "Select Folder"
4. Extension should appear in the list

### Verify Installation:
- [ ] Extension appears in extensions list
- [ ] No error messages shown
- [ ] Extension icon appears in Chrome toolbar
- [ ] Click icon opens popup interface

## Step 2: Configure Extension

### Set Up Profile:
1. Click the extension icon
2. Go to "Profile" tab
3. Fill out test information:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john.doe@asu.edu"
   - Phone: "(480) 555-0123"
   - Challenge Target: "Jane Smith"
   - Available Days: Check Monday, Wednesday, Friday
   - Preferred Time: "Afternoon"
   - Notes: "Available for practice matches"
4. Click "Save Profile"
5. Verify success message appears

### Configure Settings:
1. Go to "Settings" tab
2. Enable "Auto-Fill Forms" toggle
3. Leave "Auto-Submit Forms" disabled for testing
4. Verify status shows "Please navigate to a Google Form"

## Step 3: Create Test Google Form

### Create Form:
1. Go to https://forms.google.com
2. Click "Blank form" or use template
3. Add the following questions:

**Question 1: First Name**
- Type: Short answer
- Label: "First Name"
- Make required

**Question 2: Last Name**
- Type: Short answer  
- Label: "Last Name"
- Make required

**Question 3: Email**
- Type: Short answer
- Label: "Email Address"
- Make required

**Question 4: Challenge Target**
- Type: Short answer
- Label: "Who would you like to challenge?"

**Question 5: Available Days**
- Type: Multiple choice or Checkboxes
- Label: "Which days are you available?"
- Options: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday

**Question 6: Preferred Time**
- Type: Dropdown
- Label: "Preferred playing time"
- Options: Morning, Afternoon, Evening, Flexible

**Question 7: Additional Notes**
- Type: Paragraph
- Label: "Additional comments or notes"

### Test Form Setup:
1. Click "Preview" (eye icon)
2. Copy the preview URL
3. This is your test form

## Step 4: Test Auto-Fill Functionality

### Test Automatic Filling:
1. With extension popup open, navigate to your test form
2. Check extension status - should show "Ready to auto-fill forms"
3. Refresh the form page
4. Form should auto-fill within 1-2 seconds
5. Verify all fields are filled correctly

### Test Manual Filling:
1. Create a new blank form or clear existing form
2. Click extension icon
3. Go to Settings tab
4. Click "Fill Form Now" button
5. Verify form fills immediately
6. Check success message appears

## Step 5: Debug Common Issues

### Extension Not Loading:
```bash
# Check for file errors
- Verify manifest.json syntax is valid
- Ensure all referenced files exist
- Check console in chrome://extensions/ for errors
```

### Content Script Not Working:
```bash
# Debug steps
1. Open form page
2. Press F12 → Console tab
3. Look for "Tennis Form AutoFiller: Content script loaded"
4. If missing, reload extension and refresh page
```

### Fields Not Filling:
```bash
# Troubleshooting
1. Check if profile is saved
2. Verify auto-fill is enabled
3. Use "Test Extension" button to check form detection
4. Check browser console for JavaScript errors
```

### Popup Not Opening:
```bash
# Solutions
1. Reload extension in chrome://extensions/
2. Check for popup.html errors
3. Verify manifest.json popup configuration
```

## Step 6: Performance Testing

### Speed Test:
1. Time form filling from page load to completion
2. Target: Under 2 seconds total
3. Test with different form sizes
4. Monitor browser performance impact

### Reliability Test:
1. Test 10 consecutive form fills
2. Verify 100% success rate
3. Test with different browsers/devices
4. Validate field mapping accuracy

## Step 7: Real-World Testing

### Create ASU-Style Form:
1. Replicate actual tennis club registration form structure
2. Test with realistic field names and layouts
3. Verify all tennis-specific fields map correctly
4. Test during time-pressure scenarios

### Stress Testing:
1. Test with multiple tabs open
2. Test with slow internet connections
3. Test with complex multi-page forms
4. Verify no conflicts with other extensions

## Step 8: Production Readiness

### Final Checklist:
- [ ] All tests pass consistently
- [ ] No console errors
- [ ] Professional UI appearance
- [ ] Profile data persists correctly
- [ ] Settings save properly
- [ ] Status updates work
- [ ] Manual fill works reliably
- [ ] Auto-fill performs under time pressure

### Security Verification:
- [ ] Minimal permissions used
- [ ] No external API calls
- [ ] Data stored locally only
- [ ] No sensitive data logged

## Step 9: Distribution Preparation

### For Personal Use:
- Package as ZIP file for sharing
- Include setup instructions
- Test installation on clean browser

### For Chrome Web Store:
- Create promotional images
- Write store description
- Prepare privacy policy
- Submit for review

## Troubleshooting Quick Reference

### Common Error Solutions:

**"Extension not loaded"**
- Reload extension in chrome://extensions/
- Check file permissions
- Verify all files present

**"Form not detected"**
- Refresh Google Forms page
- Check URL matches pattern
- Verify content script injection

**"Fields not filling"**
- Check profile is saved
- Verify field label matching
- Test with simpler form first

**"Popup not working"**
- Check popup.html syntax
- Verify JavaScript console
- Reload extension

## Success Metrics
- Form filling time: < 2 seconds
- Accuracy rate: > 95%
- Zero critical errors
- Smooth user experience
- Reliable performance under pressure

## Next Steps After Testing
1. Document any issues found
2. Optimize performance bottlenecks  
3. Enhance field mapping logic
4. Add error handling improvements
5. Prepare for distribution