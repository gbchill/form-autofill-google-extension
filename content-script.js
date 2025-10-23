// Form AutoFiller - Content Script (Google Forms Optimized)
console.log('🚀 Form AutoFiller: Content script loaded');
console.log('📍 Current URL:', window.location.href);

let isFormFilled = false;
let userProfile = null;
let fillStartTime = null;

// Get user profile immediately on script load
chrome.storage.sync.get(['userProfile', 'autoFillEnabled'], (result) => {
  console.log('📦 Storage result:', result);

  userProfile = result.userProfile;
  const autoFillEnabled = result.autoFillEnabled !== false;

  console.log('👤 User profile:', userProfile);
  console.log('⚙️ Auto-fill enabled:', autoFillEnabled);

  if (userProfile && autoFillEnabled) {
    console.log('✅ Auto-fill enabled, Profile loaded:', userProfile);
    console.log('🔍 Initializing form watcher...');
    initializeFastFormWatcher();
  } else {
    if (!userProfile) {
      console.log('⚠️ No user profile found. Please set up your profile first.');
    }
    if (!autoFillEnabled) {
      console.log('⚠️ Auto-fill is disabled. Enable it in settings.');
    }
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
  console.log('🎯 Form watcher initialized');

  // Strategy 1: Immediate check
  console.log('⏱️ Strategy 1: Immediate check');
  detectAndFillForm();

  // Strategy 2: DOM ready check
  if (document.readyState === 'loading') {
    console.log('⏱️ Strategy 2: Waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('✅ DOM Content Loaded, attempting fill');
      detectAndFillForm();
    }, { once: true });
  } else {
    console.log('✅ DOM already ready');
  }

  // Strategy 3: Mutation observer for dynamic content
  console.log('⏱️ Strategy 3: Setting up mutation observer');
  const observer = new MutationObserver(() => {
    if (!isFormFilled && getGoogleFormFields().length > 0) {
      console.log('🔄 Mutation detected with form fields, attempting fill');
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
  console.log('⏱️ Strategy 4: Setting up delayed checks');
  setTimeout(() => {
    console.log('⏰ 1 second delay check');
    if (!isFormFilled) detectAndFillForm();
  }, 1000);

  setTimeout(() => {
    console.log('⏰ 2 second delay check');
    if (!isFormFilled) detectAndFillForm();
  }, 2000);

  setTimeout(() => {
    console.log('⏰ 3 second delay check');
    if (!isFormFilled) detectAndFillForm();
  }, 3000);

  setTimeout(() => {
    console.log('⏰ 4 second delay check');
    if (!isFormFilled) detectAndFillForm();
  }, 4000);

  setTimeout(() => {
    console.log('⏰ 5 second delay check (final attempt)');
    if (!isFormFilled) detectAndFillForm();
  }, 5000);
}

function isGoogleFormPage() {
  return window.location.hostname === 'docs.google.com' && 
         window.location.pathname.includes('/forms/');
}

function detectAndFillForm() {
  console.log('🔍 detectAndFillForm called');
  console.log('   - isFormFilled:', isFormFilled);
  console.log('   - userProfile exists:', !!userProfile);

  if (!userProfile) {
    console.log('❌ No user profile, skipping fill');
    return;
  }

  if (isFormFilled) {
    console.log('✅ Form already filled, skipping');
    return;
  }

  fillStartTime = performance.now();
  const fields = getGoogleFormFields();

  console.log('📋 Detect and fill - found fields:', fields.length);

  if (fields.length > 0) {
    console.log('🎉 Starting form fill with profile:', userProfile);
    fillGoogleFormFields(fields);
  } else {
    console.log('⚠️ No form fields detected yet');
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

  console.log('🔍 Starting field detection...');

  // Google Forms uses specific selectors
  // Text inputs (Name field and others) - EXPANDED SELECTORS
  const textInputSelectors = [
    'input[type="text"]',
    'input[type="email"]',
    'textarea',
    'input[aria-labelledby]',
    'input[data-initial-value]',
    'input.quantumWizTextinputPaperinputInput', // Google Forms specific class
    'input.whsOnd.zHQkBf', // Another Google Forms class
    'div[role="textbox"]', // Some forms use div with role
    'input[jsname]' // Google Forms often use jsname attribute
  ];

  const textInputs = document.querySelectorAll(textInputSelectors.join(', '));
  console.log(`📝 Found ${textInputs.length} potential text inputs`);

  textInputs.forEach((input, index) => {
    // More lenient visibility check
    const isVisible = input.offsetParent !== null || window.getComputedStyle(input).display !== 'none';
    const isReadOnly = input.readOnly; // Only reject read-only, NOT disabled (Google Forms uses disabled initially)
    const isHidden = input.type === 'hidden';

    console.log(`   Input ${index}: visible=${isVisible}, disabled=${input.disabled}, readonly=${isReadOnly}, hidden=${isHidden}, tagName=${input.tagName}`);

    // Accept disabled inputs! Google Forms disables them until user interacts
    if (isVisible && !isReadOnly && !isHidden) {
      const questionText = getGoogleFormQuestionText(input);
      console.log(`   ✅ Text field ${index} accepted:`, questionText);

      fields.push({
        element: input,
        type: 'text',
        questionText: questionText,
        index: index
      });
    } else {
      console.log(`   ❌ Text field ${index} rejected (visible=${isVisible}, readonly=${isReadOnly}, hidden=${isHidden})`);
    }
  });
  
  // Radio button groups (Challenge type)
  const radioGroups = {};
  const radios = document.querySelectorAll('div[role="radio"], div[role="radiogroup"] input[type="radio"], input[type="radio"]');

  console.log(`🔘 Found ${radios.length} radio buttons`);

  radios.forEach((radio, index) => {
    if (radio.offsetParent !== null) {
      // Find the parent question container (not the individual button label!)
      const questionText = getParentQuestionForChoice(radio);

      console.log(`   Radio ${index}: "${questionText}"`);

      // Use the full question text as the grouping key
      // This ensures all radios with the same parent question are grouped together
      const groupKey = questionText;

      if (!radioGroups[groupKey]) {
        radioGroups[groupKey] = {
          elements: [],
          type: 'radio',
          questionText: questionText,
          index: Object.keys(radioGroups).length
        };
        console.log(`   ✅ Created radio group ${Object.keys(radioGroups).length - 1}: "${questionText}"`);
      }

      radioGroups[groupKey].elements.push(radio);
    }
  });

  console.log(`📊 Total radio groups: ${Object.keys(radioGroups).length}`);
  Object.values(radioGroups).forEach((group, idx) => {
    console.log(`   Group ${idx}: ${group.elements.length} buttons - "${group.questionText.substring(0, 50)}..."`);
  });

  Object.values(radioGroups).forEach(group => {
    if (group.elements.length > 0) {
      fields.push(group);
    }
  });
  
  // Checkboxes (Practice and Challenge attendance)
  const checkboxGroups = {};
  const checkboxes = document.querySelectorAll('div[role="checkbox"], input[type="checkbox"]');

  console.log(`☑️ Found ${checkboxes.length} checkboxes`);

  checkboxes.forEach((checkbox, index) => {
    if (checkbox.offsetParent !== null) {
      // Find the parent question container (not the individual checkbox label!)
      const questionText = getParentQuestionForChoice(checkbox);

      console.log(`   Checkbox ${index}: "${questionText}"`);

      // Use the full question text as the grouping key
      const groupKey = questionText;

      if (!checkboxGroups[groupKey]) {
        checkboxGroups[groupKey] = {
          elements: [],
          type: 'checkbox',
          questionText: questionText,
          index: Object.keys(checkboxGroups).length
        };
        console.log(`   ✅ Created checkbox group ${Object.keys(checkboxGroups).length - 1}: "${questionText}"`);
      }

      checkboxGroups[groupKey].elements.push(checkbox);
    }
  });

  console.log(`📊 Total checkbox groups: ${Object.keys(checkboxGroups).length}`);
  Object.values(checkboxGroups).forEach((group, idx) => {
    console.log(`   Group ${idx}: ${group.elements.length} checkboxes - "${group.questionText.substring(0, 50)}..."`);
  });

  Object.values(checkboxGroups).forEach(group => {
    if (group.elements.length > 0) {
      fields.push(group);
    }
  });
  
  console.log(`Total fields detected: ${fields.length}`);
  return fields;
}

// Get parent question for radio/checkbox elements
// These elements have their own aria-label (the button/checkbox label)
// but we need the PARENT QUESTION that groups them together
function getParentQuestionForChoice(element) {
  let current = element;

  // Go up the DOM tree to find the question container
  for (let i = 0; i < 25; i++) {
    current = current.parentElement;
    if (!current) break;

    // Look for elements that contain the actual question text
    // Skip the individual choice labels (Monday, Tuesday, etc.)
    const headings = current.querySelectorAll('[role="heading"], .M7eMe, span.M7eMe, div.M7eMe');

    for (const heading of headings) {
      const text = heading.textContent.trim();

      // Make sure it's a substantial question, not just a choice label
      if (text.length > 10 && !text.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Yes|No|Chalenge|Battle|Challenge)$/i)) {
        return text;
      }
    }

    // Alternative: look for the question in data attributes or specific Google Forms classes
    if (current.hasAttribute('data-params')) {
      const questionContainer = current.querySelector('.freebirdFormviewerViewItemsItemItemTitle, .M7eMe');
      if (questionContainer) {
        const text = questionContainer.textContent.trim();
        if (text.length > 10) {
          return text;
        }
      }
    }
  }

  // Fallback: if we can't find the parent question, return the aria-label
  // (This shouldn't happen in normal Google Forms, but it's a safety net)
  return element.getAttribute('aria-label') || 'Unknown Question';
}

// Get question text for Google Forms
function getGoogleFormQuestionText(element) {
  console.log('🔎 Getting question text for element:', element);

  // Strategy 0: Check aria-label first (often has the question)
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.length > 2 && ariaLabel.length < 500) {
    console.log('   ✅ Found via aria-label:', ariaLabel);
    return ariaLabel;
  }

  // Strategy 1: Look for actual question container going up the DOM tree
  let current = element;
  for (let i = 0; i < 20; i++) { // Increased from 15 to 20
    current = current.parentElement;
    if (!current) break;

    // Look for Google Forms question containers with common class patterns
    const questionSelectors = [
      '[role="listitem"]', // Main question container
      '.freebirdFormviewerViewItemsItemItem',
      '.freebirdFormviewerViewItemsItemItemTitle',
      '.freebirdFormviewerViewItemsItemItemTitleContainer',
      '[data-value]',
      '.freebirdFormviewerViewItemsItemItem',
      '.Qr7Oae', // New Google Forms class
      '.geS5n' // Another common class
    ];

    for (const selector of questionSelectors) {
      const questionContainer = current.querySelector(selector);
      if (questionContainer) {
        // Look for the actual question text within this container
        const titleElement = questionContainer.querySelector('[role="heading"], .freebirdFormviewerViewItemsItemItemTitle, .M7eMe, h2, h3, span.M7eMe');
        if (titleElement) {
          const questionText = titleElement.textContent.trim();
          if (questionText.length > 2) { // Reduced from 5 to 2 to catch shorter labels like "Name"
            console.log('   ✅ Found question via title element:', questionText);
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

  console.log('   ⚠️ Could not determine question text for element');
  return 'Unknown Question';
}

// Click element with proper events to trigger Google Forms validation
function clickElementWithEvents(element) {
  console.log('   🖱️ Clicking with full event sequence...');

  // Enable element if it's disabled (Google Forms does this)
  const ariaDisabled = element.getAttribute('aria-disabled');
  if (ariaDisabled === 'true') {
    console.log('   ⚡ Removing aria-disabled...');
    element.removeAttribute('aria-disabled');
  }

  if (element.disabled) {
    console.log('   ⚡ Enabling disabled element...');
    element.disabled = false;
  }

  // Get element position for realistic mouse events
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  // Focus first
  element.focus();

  // Mouse down
  element.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y
  }));

  // Mouse up
  element.dispatchEvent(new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y
  }));

  // Click
  element.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y
  }));

  // Actual click (important for Google Forms)
  element.click();

  // Change event
  element.dispatchEvent(new Event('change', { bubbles: true }));

  // Blur
  element.dispatchEvent(new Event('blur', { bubbles: true }));

  console.log('   ✅ Click complete');
}

// Fill Google Forms fields (with delays for proper validation)
async function fillGoogleFormFields(fields) {
  if (!userProfile) {
    console.log('No user profile available');
    return;
  }

  let filledCount = 0;
  console.log('Starting to fill form fields...');

  // Fill fields with delays between each one
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index];
    console.log(`Processing field ${index}:`, field.questionText, 'Type:', field.type);

    const value = getValueForGoogleFormField(field);
    console.log(`Value to fill for field ${index}:`, value);

    if (value !== null && value !== '') {
      if (await fillGoogleFormField(field, value)) {
        filledCount++;
        console.log(`Successfully filled field ${index}`);
      } else {
        console.log(`Failed to fill field ${index}`);
      }

      // Add delay between fields to let Google Forms process validation
      // Slower delays to prevent conflicts and ensure proper filling
      if (index < fields.length - 1) {
        const delay = field.type === 'checkbox' ? 300 : field.type === 'radio' ? 250 : 200;
        console.log(`   ⏱️ Waiting ${delay}ms before next field...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } else {
      console.log(`No value determined for field ${index}`);
    }
  }
  
  if (filledCount > 0) {
    isFormFilled = true;
    const fillTime = performance.now() - fillStartTime;
    console.log(`✅ Successfully filled ${filledCount} fields in ${fillTime.toFixed(2)}ms`);

    chrome.storage.sync.set({
      lastFillTime: Date.now()
    });

    // Show visual notification
    showAutoFillNotification(filledCount);

    // Check for auto-submit
    checkAutoSubmit();
  } else {
    console.log('⚠️ No fields were filled');
  }
}

// Show a visual notification that form was auto-filled
function showAutoFillNotification(fieldCount) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    animation: slideIn 0.3s ease;
  `;
  notification.innerHTML = `✅ Form Auto-Filled! (${fieldCount} fields)`;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);

  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.transition = 'opacity 0.3s ease';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
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
async function fillGoogleFormField(field, value) {
  try {
    if (field.type === 'text') {
      return await fillGoogleTextInput(field.element, value);
    } else if (field.type === 'radio') {
      return fillGoogleRadioGroup(field, value);
    } else if (field.type === 'checkbox') {
      return await fillGoogleCheckboxGroup(field, value);
    }
  } catch (error) {
    console.error('Error filling field:', error);
  }
  return false;
}

async function fillGoogleTextInput(element, value) {
  if (!value) return false;

  console.log('📝 Filling text input with:', value);
  console.log('   Element type:', element.tagName, 'Role:', element.getAttribute('role'), 'Disabled:', element.disabled);

  // Enable the input if it's disabled (Google Forms disables inputs initially)
  if (element.disabled) {
    console.log('   ⚡ Enabling disabled input...');
    element.disabled = false;
  }

  // Handle div[role="textbox"] elements (contenteditable)
  if (element.tagName === 'DIV' && element.getAttribute('role') === 'textbox') {
    console.log('   Detected contenteditable div');
    element.focus();
    element.textContent = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
    return true;
  }

  // Handle regular input/textarea elements
  // Focus first
  element.focus();

  // Wait for focus to settle
  await new Promise(resolve => setTimeout(resolve, 100));

  // Use native setter to bypass Google Forms' input handlers
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;

  // Clear first
  if (element.tagName === 'INPUT') {
    nativeInputValueSetter.call(element, '');
  } else if (element.tagName === 'TEXTAREA') {
    nativeTextAreaValueSetter.call(element, '');
  }

  // Set the value using native setter (bypasses React/framework handlers)
  if (element.tagName === 'INPUT') {
    nativeInputValueSetter.call(element, value);
  } else if (element.tagName === 'TEXTAREA') {
    nativeTextAreaValueSetter.call(element, value);
  }

  // Trigger input event to let Google Forms know value changed
  element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

  // Wait for Google Forms to process
  await new Promise(resolve => setTimeout(resolve, 150));

  // Trigger change and blur
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

  // Verify it was set
  console.log('   ✅ Value set to:', element.value || element.textContent);

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
        clickElementWithEvents(radio);
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
        clickElementWithEvents(radio);
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
          clickElementWithEvents(radio);
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
          clickElementWithEvents(radio);
          return true;
        }
      }

      // For other values, do regular partial matching
      if (ariaLower.includes(valueLower)) {
        console.log('Radio partial match found via aria-label:', ariaLabel);
        clickElementWithEvents(radio);
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
          clickElementWithEvents(radio);
          return true;
        }

        if (parentText.includes('challenge') && parentText.includes('team')) {
          continue;
        }
      }

      if (parentText.includes(valueLower)) {
        console.log('Radio partial match found via parent text:', parent.textContent.trim());
        clickElementWithEvents(radio);
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

async function fillGoogleCheckboxGroup(field, value) {
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
          let isChecked = checkbox.getAttribute('aria-checked') === 'true' || checkbox.checked;

          if (!isChecked) {
            clickElementWithEvents(checkbox);

            // Verify it got checked, retry if needed
            await new Promise(resolve => setTimeout(resolve, 50));
            isChecked = checkbox.getAttribute('aria-checked') === 'true' || checkbox.checked;

            if (!isChecked) {
              console.log('   ⚠️ Checkbox not checked after first click, retrying...');
              clickElementWithEvents(checkbox);
              await new Promise(resolve => setTimeout(resolve, 50));
            }

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
      const isChecked = checkbox.getAttribute('aria-checked') === 'true' || checkbox.checked;
      if (!isChecked) {
        clickElementWithEvents(checkbox);
      }
      return true;
    }

    // Check nearby text
    const parent = checkbox.closest('[role="checkbox"]') || checkbox.parentElement;
    if (parent && parent.textContent.toLowerCase().includes(valueLower)) {
      console.log('Checkbox match found via parent text:', parent.textContent);
      const isChecked = checkbox.getAttribute('aria-checked') === 'true' || checkbox.checked;
      if (!isChecked) {
        clickElementWithEvents(checkbox);
      }
      return true;
    }

    // Check value attribute
    if (checkbox.value && checkbox.value.toLowerCase().includes(valueLower)) {
      console.log('Checkbox match found via value:', checkbox.value);
      const isChecked = checkbox.getAttribute('aria-checked') === 'true' || checkbox.checked;
      if (!isChecked) {
        clickElementWithEvents(checkbox);
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