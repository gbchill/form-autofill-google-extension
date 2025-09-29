// Form AutoFiller - Content Script (Google Forms Optimized)
console.log('Form AutoFiller: Content script loaded');

let isFormFilled = false;
let userProfile = null;
let fillStartTime = null;

// Get user profile immediately on script load
chrome.storage.sync.get(['userProfile', 'autoFillEnabled'], (result) => {
  userProfile = result.userProfile;
  const autoFillEnabled = result.autoFillEnabled !== false;
  
  if (userProfile && autoFillEnabled) {
    console.log('Auto-fill enabled, Profile loaded:', userProfile);
    initializeFastFormWatcher();
  } else {
    console.log('Auto-fill disabled or no profile');
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    fillStartTime = performance.now();
    console.log('Manual fill triggered');
    fillFormNow();
    sendResponse({success: true});
  } else if (request.action === 'checkFormStatus') {
    const fields = getGoogleFormFields();
    console.log('Form status check - fields found:', fields.length);
    sendResponse({
      isGoogleForm: isGoogleFormPage(),
      isFormFilled: isFormFilled,
      formFields: fields.length
    });
  }
});

function initializeFastFormWatcher() {
  // Strategy 1: Immediate check
  detectAndFillForm();
  
  // Strategy 2: DOM ready check
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectAndFillForm, { once: true });
  }
  
  // Strategy 3: Mutation observer for dynamic content
  const observer = new MutationObserver(() => {
    if (!isFormFilled && getGoogleFormFields().length > 0) {
      observer.disconnect();
      detectAndFillForm();
    }
  });
  
  const targetNode = document.body || document.documentElement;
  if (targetNode) {
    observer.observe(targetNode, {
      childList: true,
      subtree: true
    });
  }
  
  // Strategy 4: Delayed checks for slow-loading forms
  setTimeout(() => {
    if (!isFormFilled) detectAndFillForm();
  }, 1000);
  
  setTimeout(() => {
    if (!isFormFilled) detectAndFillForm();
  }, 2000);
}

function isGoogleFormPage() {
  return window.location.hostname === 'docs.google.com' && 
         window.location.pathname.includes('/forms/');
}

function detectAndFillForm() {
  if (!userProfile || isFormFilled) return;
  
  fillStartTime = performance.now();
  const fields = getGoogleFormFields();
  
  console.log('Detect and fill - found fields:', fields.length);
  
  if (fields.length > 0) {
    console.log('Starting form fill with profile:', userProfile);
    fillGoogleFormFields(fields);
  } else {
    console.log('No form fields detected');
  }
}

function fillFormNow() {
  console.log('Fill form now triggered');
  const fields = getGoogleFormFields();
  console.log('Manual fill - found fields:', fields.length);
  
  if (fields.length > 0) {
    console.log('Manual fill starting with profile:', userProfile);
    fillGoogleFormFields(fields);
  } else {
    console.log('No form fields found for manual fill');
  }
}

// Google Forms specific field detection
function getGoogleFormFields() {
  const fields = [];
  
  // Google Forms uses specific selectors
  // Text inputs (Name field and others)
  const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea, input[aria-labelledby], input[data-initial-value]');
  textInputs.forEach((input, index) => {
    if (input.offsetParent !== null && !input.disabled && input.type !== 'hidden') {
      const questionText = getGoogleFormQuestionText(input);
      console.log(`Text field ${index}:`, questionText);
      
      fields.push({
        element: input,
        type: 'text',
        questionText: questionText,
        index: index
      });
    }
  });
  
  // Radio button groups (Challenge type)
  const radioGroups = {};
  const radios = document.querySelectorAll('div[role="radio"], div[role="radiogroup"] input[type="radio"], input[type="radio"]');
  
  radios.forEach((radio, index) => {
    if (radio.offsetParent !== null) {
      const questionText = getGoogleFormQuestionText(radio);
      
      // Better grouping - use a more specific key that focuses on the actual question
      let groupKey = 'radio_unknown';
      if (questionText.includes('Would you like') || questionText.includes('challenge') || questionText.includes('battle')) {
        groupKey = 'challenge_type_question';
      } else {
        // Use first 30 chars as fallback
        groupKey = questionText.substring(0, 30);
      }
      
      if (!radioGroups[groupKey]) {
        radioGroups[groupKey] = {
          elements: [],
          type: 'radio',
          questionText: questionText,
          index: Object.keys(radioGroups).length
        };
        console.log(`Radio group ${Object.keys(radioGroups).length - 1}:`, questionText);
      }
      
      radioGroups[groupKey].elements.push(radio);
    }
  });
  
  Object.values(radioGroups).forEach(group => {
    if (group.elements.length > 0) {
      fields.push(group);
    }
  });
  
  // Checkboxes (Practice and Challenge attendance)
  const checkboxGroups = {};
  const checkboxes = document.querySelectorAll('div[role="checkbox"], input[type="checkbox"]');
  
  checkboxes.forEach((checkbox, index) => {
    if (checkbox.offsetParent !== null) {
      const questionText = getGoogleFormQuestionText(checkbox);
      
      // Better grouping for checkboxes
      let groupKey = 'checkbox_unknown';
      if (questionText.includes('Attendance') && questionText.includes('practice')) {
        groupKey = 'practice_attendance';
      } else if (questionText.includes('Challenge') && questionText.includes('Attendance')) {
        groupKey = 'challenge_attendance';
      } else {
        // Use first 40 chars as fallback
        groupKey = questionText.substring(0, 40);
      }
      
      if (!checkboxGroups[groupKey]) {
        checkboxGroups[groupKey] = {
          elements: [],
          type: 'checkbox',
          questionText: questionText,
          index: Object.keys(checkboxGroups).length
        };
        console.log(`Checkbox group ${Object.keys(checkboxGroups).length - 1}:`, questionText);
      }
      
      checkboxGroups[groupKey].elements.push(checkbox);
    }
  });
  
  Object.values(checkboxGroups).forEach(group => {
    if (group.elements.length > 0) {
      fields.push(group);
    }
  });
  
  console.log(`Total fields detected: ${fields.length}`);
  return fields;
}

// Get question text for Google Forms
function getGoogleFormQuestionText(element) {
  // Strategy 1: Look for actual question container going up the DOM tree
  let current = element;
  for (let i = 0; i < 15; i++) {
    current = current.parentElement;
    if (!current) break;
    
    // Look for Google Forms question containers with common class patterns
    const questionSelectors = [
      '[role="listitem"]', // Main question container
      '.freebirdFormviewerViewItemsItemItem', 
      '.freebirdFormviewerViewItemsItemItemTitle',
      '.freebirdFormviewerViewItemsItemItemTitleContainer',
      '[data-value]',
      '.freebirdFormviewerViewItemsItemItem'
    ];
    
    for (const selector of questionSelectors) {
      const questionContainer = current.querySelector(selector);
      if (questionContainer) {
        // Look for the actual question text within this container
        const titleElement = questionContainer.querySelector('[role="heading"], .freebirdFormviewerViewItemsItemItemTitle, h2, h3');
        if (titleElement) {
          const questionText = titleElement.textContent.trim();
          if (questionText.length > 5) {
            console.log('Found question via title element:', questionText);
            return questionText;
          }
        }
      }
    }
    
    // Look for question text in current element
    const currentText = current.textContent.trim();
    // Check if this looks like a question (contains question markers and reasonable length)
    if (currentText.length > 20 && currentText.length < 800 && 
        (currentText.includes('*') || currentText.includes('?') || 
         currentText.includes('Select') || currentText.includes('Would you like') ||
         currentText.includes('Name') || currentText.includes('Attendance') ||
         currentText.includes('who would you like') || currentText.includes('challenging') ||
         currentText.includes('partner'))) {
      
      // Clean up the text to get just the question part
      const lines = currentText.split('\n').filter(line => line.trim().length > 0);
      for (const line of lines) {
        if (line.includes('*') || line.includes('?') || 
            line.includes('Select') || line.includes('Would you like') ||
            (line.includes('Name') && line.length < 50) ||
            line.includes('Attendance') ||
            line.includes('who would you like') || 
            line.includes('challenging') || line.includes('partner')) {
          console.log('Found question via text analysis:', line.trim());
          return line.trim();
        }
      }
    }
  }
  
  // Strategy 2: Look for aria-label as fallback
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.length > 3) {
    console.log('Using aria-label:', ariaLabel);
    return ariaLabel;
  }
  
  console.log('Could not determine question text for element');
  return 'Unknown Question';
}

// Fill Google Forms fields
function fillGoogleFormFields(fields) {
  if (!userProfile) {
    console.log('No user profile available');
    return;
  }
  
  let filledCount = 0;
  console.log('Starting to fill form fields...');
  
  fields.forEach((field, index) => {
    console.log(`Processing field ${index}:`, field.questionText, 'Type:', field.type);
    
    const value = getValueForGoogleFormField(field);
    console.log(`Value to fill for field ${index}:`, value);
    
    if (value !== null && value !== '') {
      if (fillGoogleFormField(field, value)) {
        filledCount++;
        console.log(`Successfully filled field ${index}`);
      } else {
        console.log(`Failed to fill field ${index}`);
      }
    } else {
      console.log(`No value determined for field ${index}`);
    }
  });
  
  if (filledCount > 0) {
    isFormFilled = true;
    const fillTime = performance.now() - fillStartTime;
    console.log(`Successfully filled ${filledCount} fields in ${fillTime.toFixed(2)}ms`);
    
    chrome.storage.sync.set({
      lastFillTime: Date.now()
    });
    
    // Check for auto-submit
    checkAutoSubmit();
  } else {
    console.log('No fields were filled');
  }
}

// Determine value for Google Form field
function getValueForGoogleFormField(field) {
  const questionText = field.questionText.toLowerCase();
  console.log('Analyzing question:', questionText);
  
  // Individual challenge target field - CHECK FIRST (before name field)
  if (field.type === 'text' && 
      (questionText.includes('challenging or battling individually') ||
       questionText.includes('who would you like to challenge') ||
       questionText.includes('who would you like to battle')) &&
      !questionText.includes('partner') && !questionText.includes('team')) {
    
    console.log('🎯 Individual challenge/battle target field detected');
    console.log('Question text:', questionText);
    console.log('User challenge type:', userProfile.challengeType);
    console.log('User challenge target:', userProfile.challengeTarget);
    
    // Only fill if user selected individual challenge or battle
    if (userProfile.challengeType) {
      const challengeType = userProfile.challengeType.toLowerCase();
      
      if (challengeType === 'challenge' || challengeType === 'battle') {
        console.log('✅ Individual challenge/battle selected, returning target:', userProfile.challengeTarget);
        return userProfile.challengeTarget || '';
      } else {
        console.log('❌ Not individual challenge/battle, leaving field empty');
        return '';
      }
    }
    
    console.log('📝 Fallback: returning challenge target:', userProfile.challengeTarget);
    return userProfile.challengeTarget || '';
  }
  
  // Team partner name field - CHECK SECOND (before name field)
  if (field.type === 'text' && 
      (questionText.includes('partners name') || 
       questionText.includes('partner name') ||
       (questionText.includes('challenging as a team') && questionText.includes('list')) ||
       (questionText.includes('team') && questionText.includes('list')))) {
    
    console.log('👥 Team partner name field detected');
    console.log('Question text:', questionText);
    console.log('User challenge type:', userProfile.challengeType);
    console.log('User partner name:', userProfile.partnerName);
    
    // Only fill if user selected team challenge
    if (userProfile.challengeType) {
      const challengeType = userProfile.challengeType.toLowerCase();
      
      if (challengeType.includes('team') || challengeType.includes('doubles')) {
        console.log('✅ Team challenge selected, returning partner name:', userProfile.partnerName);
        return userProfile.partnerName || '';
      } else {
        console.log('❌ Not team challenge, leaving partner field empty');
        return '';
      }
    }
    
    console.log('📝 User has no team challenge type, leaving empty');
    return '';
  }

  // Name field - CHECK LAST (only for actual name fields)
  if (questionText.includes('name') && field.type === 'text' && 
      !questionText.includes('partner') && !questionText.includes('challenge') && 
      !questionText.includes('battle') && !questionText.includes('team')) {
    console.log('📝 Identified as name field, returning:', userProfile.fullName);
    return userProfile.fullName;
  }
  
  // Practice attendance - return array of days to check
  if (questionText.includes('attendance') && questionText.includes('practice')) {
    if (field.type === 'checkbox') {
      console.log('Practice attendance checkbox group detected');
      console.log('User selected practice days:', userProfile.practiceDays);
      return userProfile.practiceDays || [];
    }
    return null;
  }
  
  // Challenge attendance - return array of days to check
  if (questionText.includes('challenge') && questionText.includes('attendance')) {
    if (field.type === 'checkbox') {
      console.log('Challenge attendance checkbox group detected');
      console.log('User selected challenge days:', userProfile.challengeDays);
      return userProfile.challengeDays || [];
    }
    return null;
  }
  
  // Challenge type selection - be more specific
  if ((questionText.includes('would you like') && questionText.includes('challenge')) ||
      (questionText.includes('challenge') && questionText.includes('battle') && questionText.includes('team'))) {
    if (field.type === 'radio' && userProfile.challengeType) {
      console.log('Challenge type field detected, user preference:', userProfile.challengeType);
      return userProfile.challengeType;
    }
    return null;
  }
  
  
  console.log('No matching pattern found for:', questionText);
  return null;
}

// Fill specific Google Form field
function fillGoogleFormField(field, value) {
  try {
    if (field.type === 'text') {
      return fillGoogleTextInput(field.element, value);
    } else if (field.type === 'radio') {
      return fillGoogleRadioGroup(field, value);
    } else if (field.type === 'checkbox') {
      return fillGoogleCheckboxGroup(field, value);
    }
  } catch (error) {
    console.error('Error filling field:', error);
  }
  return false;
}

function fillGoogleTextInput(element, value) {
  if (!value) return false;
  
  console.log('Filling text input with:', value);
  
  // Focus the element
  element.focus();
  
  // Clear existing value
  element.value = '';
  
  // Set new value
  element.value = value;
  
  // Trigger all possible events
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('keyup', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
  
  return true;
}

function fillGoogleRadioGroup(field, value) {
  console.log('Filling radio group with value:', value, 'from', field.elements.length, 'options');
  
  const valueLower = value.toLowerCase();
  
  // Log all available options first
  field.elements.forEach((radio, index) => {
    const ariaLabel = radio.getAttribute('aria-label');
    const parent = radio.closest('[role="radio"]') || radio.parentElement;
    const parentText = parent ? parent.textContent.trim() : '';
    console.log(`Option ${index}: aria-label="${ariaLabel}", text="${parentText}"`);
  });
  
  for (const radio of field.elements) {
    // Strategy 1: Check aria-label with exact matching
    const ariaLabel = radio.getAttribute('aria-label');
    if (ariaLabel) {
      const ariaLower = ariaLabel.toLowerCase().trim();
      
      // Exact match first
      if (ariaLower === valueLower) {
        console.log('Radio EXACT match found via aria-label:', ariaLabel);
        radio.click();
        return true;
      }
    }
    
    // Strategy 2: Check parent text content
    const parent = radio.closest('[role="radio"]') || radio.parentElement;
    if (parent) {
      const parentText = parent.textContent.toLowerCase().trim();
      
      // Exact match
      if (parentText === valueLower) {
        console.log('Radio EXACT match found via parent text:', parent.textContent.trim());
        radio.click();
        return true;
      }
    }
  }
  
  // Strategy 3: Smart fuzzy matching (handles typos and partial matches)
  for (const radio of field.elements) {
    const ariaLabel = radio.getAttribute('aria-label');
    if (ariaLabel) {
      const ariaLower = ariaLabel.toLowerCase();
      
      // Special handling for "Challenge" - match "Chalenge" (typo in form)
      if (valueLower === 'challenge') {
        if (ariaLower === 'chalenge' || ariaLower.includes('chalenge')) {
          console.log('Radio TYPO match found! "Challenge" matches "Chalenge":', ariaLabel);
          radio.click();
          return true;
        }
        
        // Don't match "Challenge as a team" for "Challenge"
        if (ariaLower.includes('challenge') && ariaLower.includes('team')) {
          console.log('Skipping "Challenge as a team" when looking for "Challenge"');
          continue;
        }
        
        // Partial match for "challenge"
        if (ariaLower.includes('challenge')) {
          console.log('Radio partial match found via aria-label:', ariaLabel);
          radio.click();
          return true;
        }
      }
      
      // For other values, do regular partial matching
      if (ariaLower.includes(valueLower)) {
        console.log('Radio partial match found via aria-label:', ariaLabel);
        radio.click();
        return true;
      }
    }
    
    // Check parent text for partial match
    const parent = radio.closest('[role="radio"]') || radio.parentElement;
    if (parent) {
      const parentText = parent.textContent.toLowerCase();
      
      // Same logic for parent text
      if (valueLower === 'challenge') {
        if (parentText.includes('chalenge')) {
          console.log('Radio TYPO match found via parent text! "Challenge" matches "Chalenge"');
          radio.click();
          return true;
        }
        
        if (parentText.includes('challenge') && parentText.includes('team')) {
          continue;
        }
      }
      
      if (parentText.includes(valueLower)) {
        console.log('Radio partial match found via parent text:', parent.textContent.trim());
        radio.click();
        return true;
      }
    }
  }
  
  console.log('ERROR: No radio match found for:', value);
  console.log('Available options were:');
  field.elements.forEach((radio, index) => {
    const ariaLabel = radio.getAttribute('aria-label');
    const parent = radio.closest('[role="radio"]') || radio.parentElement;
    const parentText = parent ? parent.textContent.trim() : '';
    console.log(`  ${index}: "${ariaLabel}" / "${parentText}"`);
  });
  
  return false;
}

function fillGoogleCheckboxGroup(field, value) {
  console.log('Filling checkbox group, looking for:', value);
  
  // Handle array of days (for attendance fields)
  if (Array.isArray(value)) {
    console.log('Processing checkbox group with multiple days:', value);
    let checkedCount = 0;
    
    for (const day of value) {
      const dayLower = day.toLowerCase();
      console.log('Looking for day:', day);
      
      for (const checkbox of field.elements) {
        const ariaLabel = checkbox.getAttribute('aria-label');
        if (ariaLabel && ariaLabel.toLowerCase().includes(dayLower)) {
          console.log('Checkbox match found for', day, ':', ariaLabel);
          if (!checkbox.checked) {
            checkbox.click();
            checkedCount++;
          }
          break; // Move to next day
        }
      }
    }
    
    console.log(`Successfully checked ${checkedCount} checkboxes out of ${value.length} days`);
    return checkedCount > 0;
  }
  
  // Handle single value (fallback)
  const valueLower = value.toLowerCase();
  
  for (const checkbox of field.elements) {
    // Check aria-label
    const ariaLabel = checkbox.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.toLowerCase().includes(valueLower)) {
      console.log('Checkbox match found via aria-label:', ariaLabel);
      if (!checkbox.checked) {
        checkbox.click();
      }
      return true;
    }
    
    // Check nearby text
    const parent = checkbox.closest('[role="checkbox"]') || checkbox.parentElement;
    if (parent && parent.textContent.toLowerCase().includes(valueLower)) {
      console.log('Checkbox match found via parent text:', parent.textContent);
      if (!checkbox.checked) {
        checkbox.click();
      }
      return true;
    }
    
    // Check value attribute
    if (checkbox.value && checkbox.value.toLowerCase().includes(valueLower)) {
      console.log('Checkbox match found via value:', checkbox.value);
      if (!checkbox.checked) {
        checkbox.click();
      }
      return true;
    }
  }
  
  console.log('No checkbox match found for:', value);
  return false;
}

// Auto-submit function
function checkAutoSubmit() {
  chrome.storage.sync.get(['autoSubmitEnabled'], (result) => {
    if (result.autoSubmitEnabled) {
      console.log('Auto-submit is enabled, looking for submit button...');
      
      // Wait a moment for the form to settle after filling
      setTimeout(() => {
        findAndClickSubmitButton();
      }, 1000);
    } else {
      console.log('Auto-submit is disabled');
    }
  });
}

function findAndClickSubmitButton() {
  // Google Forms submit button selectors (try multiple approaches)
  const submitSelectors = [
    'div[role="button"][aria-label*="Submit"]',
    'div[role="button"][aria-label*="submit"]', 
    'span[role="button"]:contains("Submit")',
    'div[role="button"]:contains("Submit")',
    'button[type="submit"]',
    'input[type="submit"]',
    'div[jsname="M2UYVd"]', // Google Forms specific
    'div[data-value="Submit"]',
    '.freebirdFormviewerViewNavigationSubmitButton'
  ];
  
  for (const selector of submitSelectors) {
    const submitButton = document.querySelector(selector);
    if (submitButton && submitButton.offsetParent !== null) {
      console.log('Found submit button via selector:', selector);
      console.log('Submit button element:', submitButton);
      
      // Try clicking the button
      submitButton.click();
      console.log('Auto-submit: Form submitted successfully!');
      return true;
    }
  }
  
  // Fallback: look for any button with "Submit" text
  const allButtons = document.querySelectorAll('div[role="button"], button, input[type="button"]');
  for (const button of allButtons) {
    if (button.textContent.toLowerCase().includes('submit') || 
        button.getAttribute('aria-label')?.toLowerCase().includes('submit')) {
      console.log('Found submit button via text search:', button.textContent.trim());
      button.click();
      console.log('Auto-submit: Form submitted via fallback method!');
      return true;
    }
  }
  
  console.log('Auto-submit: Could not find submit button');
  return false;
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (isGoogleFormPage()) {
      console.log('Google Form detected on DOM ready');
    }
  });
} else {
  if (isGoogleFormPage()) {
    console.log('Google Form detected immediately');
  }
}