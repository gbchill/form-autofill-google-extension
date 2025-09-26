# Create Extension Icons

## Task
Create the icon files needed for the Chrome extension. Since we need actual image files, I'll provide multiple approaches for creating them.

## Required Icons
- `icons/icon16.png` (16x16 pixels)
- `icons/icon48.png` (48x48 pixels)
- `icons/icon128.png` (128x128 pixels)

## Method 1: Simple Placeholder Icons (Quickest)

Create solid color squares as placeholders:

### Using VS Code or any text editor:
1. Create the `icons/` folder in your project
2. Download any tennis-related images from free sources:
   - Unsplash.com (search "tennis")
   - Pixabay.com (search "tennis ball")
   - Flaticon.com (search "tennis icon")

### Using online tools:
1. Go to https://favicon.io/favicon-generator/
2. Type "🎾" as text
3. Choose a background color (blue #007bff)
4. Download the generated favicons
5. Rename them to match our requirements

## Method 2: Create with Online Image Editor

### Using Canva or similar:
1. Go to canva.com
2. Create custom size: 128x128
3. Add tennis ball emoji or icon
4. Add background color
5. Download as PNG
6. Resize to create 48x48 and 16x16 versions

## Method 3: Use Command Line (if available)

If you have ImageMagick installed:

```bash
# Create a simple colored square with tennis emoji
convert -size 128x128 xc:"#007bff" -pointsize 80 -fill white -gravity center -annotate 0 "🎾" icon128.png

# Resize for other sizes
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png
```

## Method 4: Download Ready Icons

### Free tennis icons from:
1. **Flaticon**: https://www.flaticon.com/search?word=tennis
2. **IconFinder**: https://www.iconfinder.com/search/?q=tennis
3. **Icons8**: https://icons8.com/icons/set/tennis

### Requirements for downloaded icons:
- PNG format
- Transparent background preferred
- Simple, recognizable design
- High contrast for small sizes

## Method 5: Create Programmatically (Advanced)

If you want to create them with code, create a simple HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .icon {
            width: 128px;
            height: 128px;
            background: #007bff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 80px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="icon">🎾</div>
    <!-- Right-click and save as image -->
</body>
</html>
```

## Fallback: Use Emoji as Icons

If all else fails, you can create simple text-based icons by:
1. Creating a colored background square
2. Adding the tennis ball emoji 🎾 
3. Saving in different sizes

## File Structure After Creation

Your `icons/` folder should contain:
```
icons/
├── icon16.png
├── icon48.png
└── icon128.png
```

## Validation
After creating icons:
1. Check file sizes are appropriate (under 50KB each)
2. Verify PNG format
3. Test they display correctly in the extension
4. Ensure they're visible against different backgrounds

## Note for Claude Code
Create placeholder colored squares with tennis emoji if no image editing tools are available. The extension will work with simple placeholder icons - you can always update them later with better graphics.

## Testing
Once icons are created:
1. Load the extension in Chrome
2. Check the icon appears in the toolbar
3. Verify it shows in the extensions page
4. Test that clicking opens the popup