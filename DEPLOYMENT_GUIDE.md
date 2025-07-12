# DNA Diet Club - Local Deployment Guide

## 📦 Download & Setup

### Option 1: Download from Replit
1. Click the **three dots menu** (⋯) in the top-right corner of Replit
2. Select **"Download as zip"**
3. Extract the zip file to your desired folder
4. Open terminal/command prompt in the extracted folder

### Option 2: Clone Repository (if using Git)
```bash
git clone <your-repo-url>
cd dna-diet-club
```

## 🛠️ Installation & Launch

### Prerequisites
- **Node.js** (version 18 or higher) - Download from [nodejs.org](https://nodejs.org)
- **npm** (comes with Node.js)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup (Optional)
Create a `.env` file in the root directory for optional features:
```env
# Optional: Dexcom Integration
DEXCOM_CLIENT_ID=your_dexcom_client_id
DEXCOM_CLIENT_SECRET=your_dexcom_client_secret

# Optional: xAI/Grok AI Features
XAI_API_KEY=your_xai_api_key

# Optional: PayPal Payments
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

### 3. Launch the Application
```bash
npm run dev
```

### 4. Access the App
- Open your browser and go to: **http://localhost:5000**
- The app will automatically open to the patient dashboard
- No login required - uses demo data by default

## 🏗️ What's Included

### ✅ Ready to Use Features
- **Patient Dashboard** - Health metrics, adaptive theming, mobile preview
- **Provider Dashboard** - Patient management, AI tools (demo mode)
- **Adaptive Color Scheme** - Modern Minimalist theme with health-based colors
- **Mobile-Optimized Design** - PWA-ready for iOS/Android
- **Demo Data** - Pre-loaded test patients and health information
- **Health Tips** - Personalized daily recommendations
- **Messaging System** - Provider-to-patient communication

### 🔧 Demo Mode Features
- **AI Insights** - Works without API keys using demo responses
- **Payment System** - Simulated PayPal/Stripe integration
- **Dexcom Integration** - Generates realistic glucose data for testing

## 📱 Mobile Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the **Share** button
3. Select **"Add to Home Screen"**
4. Tap **"Add"** to install as a native app

### Android (Chrome)
1. Open the app in Chrome
2. Tap the **three dots menu** (⋯)
3. Select **"Add to Home Screen"** or **"Install App"**
4. Tap **"Install"** to add as a native app

## 🎨 Customization

### Change Color Scheme
- The app currently uses the **Modern Minimalist** theme
- 6 color schemes available: Medical Professional, Nature Wellness, Ocean Therapy, Sunset Vitality, Forest Zen, Modern Minimalist
- Colors automatically adapt based on patient health metrics

### Add Your Logo
- Replace `/public/logo.png` with your company logo
- Recommended size: 512x512 pixels
- The app includes automatic fallback to DNA helix logo

## 🔄 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run type-check

# Database migrations (if using PostgreSQL)
npm run db:push
```

## 🚀 Production Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload the 'dist' folder to Netlify
```

### Deploy to Replit
- The app is already configured for Replit deployment
- Click the **Deploy** button in Replit interface

## 🔐 Security Notes

- Demo mode is safe for testing - no real payments or data transmission
- For production use, add proper API keys and configure environment variables
- The app includes built-in security features and error handling

## 📞 Support

- The app is fully functional in demo mode
- All adaptive theming and mobile features work immediately
- No external dependencies required for core functionality

---

**Ready to use!** The DNA Diet Club app will launch with the Modern Minimalist color scheme and all features working in demo mode.