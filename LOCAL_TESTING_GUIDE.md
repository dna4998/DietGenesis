# Local Testing Guide - DNA Diet Club

## 🏠 Test the App on Your Computer

### Prerequisites
1. **Download Node.js** from [nodejs.org](https://nodejs.org) (version 18 or higher)
2. **Download the project** from Replit:
   - Click the **three dots menu** (⋯) in top-right of Replit
   - Select **"Download as zip"**
   - Extract to your desired folder

### Quick Start Commands
```bash
# Navigate to the project folder
cd dna-diet-club

# Install all dependencies
npm install

# Start the application
npm run dev
```

### Access Your Local App
- Open your browser to: **http://localhost:5000**
- The Modern Minimalist themed app will load immediately!

## 🎯 What You'll See

### Patient Dashboard Features
- **Adaptive Color Theme** - Modern Minimalist with health-based color changes
- **Health Metrics Cards** - Weight, blood pressure, insulin resistance tracking
- **Interactive Demo Controls** - Adjust health values to see color theme changes
- **Mobile Preview** - See how the app looks on phones/tablets
- **Daily Health Tips** - Personalized recommendations
- **Subscription Status** - Payment integration (demo mode)
- **Dexcom Integration** - Glucose monitoring (demo data)

### Provider Dashboard Access ✅ Working
- Navigate to: **http://localhost:5000/provider** or **http://localhost:5000/provider-dashboard**
- **Patient Management** - View all patients with health metrics and statistics
- **Provider Tools** - AI Analysis, Health Predictions, Patient Messaging
- **Interactive Patient Cards** - Individual patient management with quick actions
- **Lazy Loading** - Optimized performance with on-demand component loading

## 🧪 Testing Features

### 1. Adaptive Theme Testing
- Use the **Theme Demo Controls** on patient dashboard
- Adjust health metrics (weight, blood pressure, etc.)
- Watch colors change automatically:
  - **Excellent**: Sophisticated teal-green
  - **Good**: Clean bright blue
  - **Fair**: Refined golden yellow
  - **Needs Attention**: Modern warm orange
  - **Critical**: Elegant muted red

### 2. Mobile Testing
- **Responsive Design**: Resize your browser window
- **Mobile Preview**: Use the mobile simulator on the dashboard
- **PWA Features**: Try "Add to Home Screen" functionality

### 3. AI Features (Demo Mode)
- **Patient AI**: Text-based health assistant
- **Provider AI**: Nutrition insights, meal plans, exercise plans
- All work without API keys using realistic demo responses

### 4. Payment System Testing
- **Subscription Flow**: Try the payment modal
- **Multiple Options**: PayPal and Stripe integration
- **Demo Mode**: No real payments, safe testing

## 📱 Mobile App Testing

### Install as Mobile App
**iOS Safari:**
1. Open **http://localhost:5000** in Safari
2. Tap **Share** → **"Add to Home Screen"**
3. Test as native app

**Android Chrome:**
1. Open **http://localhost:5000** in Chrome
2. Tap **menu** → **"Add to Home Screen"**
3. Install and test

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## ✅ What Works Locally

### Immediate Features
- **Complete UI** - All dashboards and components
- **Adaptive Theming** - Color changes based on health metrics
- **Mobile Optimization** - PWA-ready responsive design
- **Demo Data** - Pre-loaded patients and health information
- **AI Features** - Demo mode with realistic responses
- **Payment UI** - Complete subscription interface (demo)
- **File Uploads** - PDF handling and messaging system

### Advanced Features (Demo Mode)
- **Dexcom Integration** - Generates realistic glucose data
- **Health Predictions** - ML-powered analytics
- **Risk Assessments** - Heart attack and cancer risk scoring
- **Voice Commands** - Text-based health assistant
- **Personalized Tips** - Daily health recommendations

## 🎨 Customization Testing

### Logo Testing
- Replace `/public/logo.png` with your logo
- Test automatic fallback to DNA helix icon

### Color Scheme Testing
- 6 different color schemes available
- Currently set to Modern Minimalist
- Test theme switching functionality

## 🚀 Production Testing

### Environment Variables (Optional)
Create `.env` file for advanced features:
```env
# Optional: Real AI features
XAI_API_KEY=your_key_here

# Optional: Real payments  
PAYPAL_CLIENT_ID=your_key_here
PAYPAL_CLIENT_SECRET=your_key_here

# Optional: Real glucose data
DEXCOM_CLIENT_ID=your_key_here
DEXCOM_CLIENT_SECRET=your_key_here
```

### Build Testing
```bash
# Test production build
npm run build
npm run preview
```

## 🔍 Troubleshooting

### Common Issues
- **Port in use**: Kill other Node.js processes
- **Dependencies**: Delete `node_modules` and run `npm install` again
- **Browser cache**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)

### Performance Testing
- **Load Speed**: App starts in ~2 seconds
- **Responsiveness**: Test on different screen sizes
- **Mobile Performance**: Check touch interactions

---

Your DNA Diet Club app is fully functional locally with the Modern Minimalist theme and all demo features working perfectly!