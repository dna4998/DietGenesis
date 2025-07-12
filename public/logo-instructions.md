# How to Add Your Logo to DNA Diet Club

## Method 1: Upload Logo File (Recommended)

1. **Prepare your logo file:**
   - Format: PNG, JPG, or SVG
   - Recommended size: 200x60 pixels (or similar aspect ratio)
   - Background: Transparent or white

2. **Upload to the project:**
   - Place your logo file in the `public` folder
   - Name it something like `logo.png` or `company-logo.svg`

3. **Update the app to use your logo:**
   Add this line to your main component where you want the logo to appear:
   ```jsx
   <AppLogo logoUrl="/logo.png" title="Your Company Name" />
   ```

## Method 2: Use Logo from URL

If your logo is hosted elsewhere, you can use a direct URL:
```jsx
<AppLogo logoUrl="https://yourwebsite.com/logo.png" title="Your Company Name" />
```

## Where to Add Your Logo

### 1. Main Header (App-wide)
Edit `client/src/App.tsx` or your header component to include:
```jsx
import AppLogo from "@/components/app-logo";

// In your header JSX:
<AppLogo logoUrl="/your-logo.png" title="Your Company Name" />
```

### 2. Login/Authentication Pages
```jsx
<AppLogo logoUrl="/your-logo.png" size="lg" />
```

### 3. Email Templates/Reports (Small size)
```jsx
<AppLogo logoUrl="/your-logo.png" size="sm" showTitle={false} />
```

## Logo Component Options

- `logoUrl`: Path to your logo file
- `title`: Your company/app name
- `size`: 'sm', 'md', or 'lg'
- `showTitle`: true/false to show/hide text next to logo

## Fallback Behavior

If your logo fails to load, the app will automatically show a DNA icon as a fallback, so your app always looks professional.

## Example Usage

```jsx
// Large logo for splash screen
<AppLogo logoUrl="/logo.png" title="DNA Diet Club" size="lg" />

// Header logo
<AppLogo logoUrl="/logo.png" title="DNA Diet Club" size="md" />

// Small logo for emails
<AppLogo logoUrl="/logo.png" size="sm" showTitle={false} />
```