# 🎨 Add Your Logo to DNA Diet Club

## Quick Setup (3 Steps)

### Step 1: Prepare Your Logo
- **File format**: PNG, JPG, or SVG
- **Recommended size**: 200x60 pixels (width x height)
- **Background**: Transparent or white works best
- **File name**: Something simple like `logo.png` or `company-logo.svg`

### Step 2: Upload Your Logo
1. Place your logo file in the `public` folder (same level as index.html)
2. Name it clearly, like `my-logo.png`

### Step 3: Activate Your Logo
Edit the file `client/src/App.tsx` and find this line:
```javascript
const logoUrl = undefined; // Currently using default DNA icon
```

Change it to:
```javascript
const logoUrl = "/my-logo.png"; // Replace with your actual filename
```

**That's it!** Your logo will now appear in the header.

## Example

If your logo file is called `health-clinic-logo.png`:

1. Put `health-clinic-logo.png` in the `public` folder
2. Change the line in App.tsx to:
   ```javascript
   const logoUrl = "/health-clinic-logo.png";
   ```

## Customize Company Name

You can also change the app title by modifying:
```javascript
title="Your Company Name"
```

## Test Your Logo

After making changes:
1. The app will automatically reload
2. You should see your logo in the top-left corner
3. If your logo doesn't load, the app will show a DNA icon as backup

## Troubleshooting

**Logo not showing?**
- Check that the file is in the `public` folder (not `client/public`)
- Make sure the filename matches exactly (case-sensitive)
- Verify the file path starts with `/` like `/logo.png`

**Logo too big or small?**
- The app automatically resizes logos to fit properly
- For best results, use a logo that's roughly 3:1 width-to-height ratio

## Example Logo Files

I've included a sample logo at `public/sample-logo.svg` that you can use as a starting point or replace with your own design.