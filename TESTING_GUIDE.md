# DNA Diet Club - Testing Guide

This guide will walk you through testing all the features of the DNA Diet Club health management platform.

## Getting Started

1. **Access the Application**: The app is running at `http://localhost:5000`
2. **Pre-loaded Test Data**: Sample patients and providers are already loaded
3. **Demo Mode**: Most features work in demo mode without external API keys

## Patient Dashboard Testing

### Test Patient Login
- Navigate to the patient dashboard
- Sample patient: John Doe (ID: 1)
- Features to test:
  - Health metrics display
  - Daily personalized health tips
  - Message center with provider communications
  - Subscription status

### Health Features
1. **Daily Health Tips**
   - Refresh the page to see personalized tips
   - Tips are customized based on patient conditions (diabetes, hypertension)

2. **Subscription Management**
   - View current subscription status
   - Test PayPal subscription flow (demo mode - no real payment)
   - Available plans: $4.99/month or $50/year

3. **Dexcom CGM Connection**
   - Click on Dexcom integration card
   - Test the connection wizard (4-step process)
   - Wizard works in demo mode with simulated OAuth flow

## Provider Dashboard Testing

### Provider Access
- Navigate to the provider dashboard
- Sample provider: Dr. Sarah Johnson
- Comprehensive patient management tools

### AI-Powered Features
1. **AI Insights Generation**
   - Select a patient (John Doe)
   - Click "Generate AI Insights"
   - Uses Grok AI for nutrition analysis
   - Provides recommendations, warnings, and metabolic analysis

2. **AI Meal Planning**
   - Click "Generate Meal Plan" for any patient
   - Creates personalized weekly meal plans
   - Includes macro breakdown and shopping lists

3. **AI Exercise Planning**
   - Generate customized exercise routines
   - Equipment recommendations and safety tips
   - Progressive training plans

### Advanced AI Workflow
1. **AI Plan Generator**
   - Click "Generate Comprehensive Plan" for a patient
   - Upload lab results (PDF)
   - Upload gut biome test results (PDF)
   - AI analyzes documents and creates treatment plans
   - Plans are automatically sent to patients

### Health Analytics
1. **Predictive Health Trends**
   - View health trend predictions for patients
   - Heart attack and cancer risk assessments
   - Machine learning-powered analytics

2. **Health Tip Management**
   - View personalized daily tips for patients
   - Tips adapt based on patient conditions

### Messaging System
1. **Send Messages to Patients**
   - Text messages with rich formatting
   - Upload PDF documents (5MB limit)
   - Share video and PDF links
   - Specialized uploads for lab results and gut biome tests

### Dexcom Management
1. **Provider Overview**
   - View all patient Dexcom connections
   - Connection statistics and status

2. **Troubleshooting Panel**
   - Diagnostic tools for Dexcom integration
   - Configuration status and connection testing
   - Setup instructions for API registration

## Testing Scenarios

### Scenario 1: New Patient Onboarding
1. Go to provider dashboard
2. View patient John Doe's profile
3. Generate AI insights for baseline health assessment
4. Create personalized meal and exercise plans
5. Send welcome message with plans attached

### Scenario 2: CGM Integration
1. Go to patient dashboard
2. Access Dexcom integration
3. Follow the connection wizard steps
4. Test the visual progress and status updates
5. Return to provider dashboard to view connection status

### Scenario 3: Comprehensive Health Analysis
1. Provider uploads lab results for patient
2. Upload gut biome test results
3. Generate comprehensive AI treatment plan
4. Review AI-generated recommendations
5. Confirm plan is sent to patient automatically

### Scenario 4: Subscription Management
1. Patient views subscription status
2. Test PayPal subscription flow
3. Verify subscription activation
4. Check plan management features

## API Endpoints for Direct Testing

Use these endpoints with tools like Postman or curl:

```bash
# Get patient data
GET /api/patients/1

# Generate AI insights
POST /api/patients/1/insights

# Create meal plan
POST /api/patients/1/meal-plan

# Dexcom connection
GET /api/dexcom/connect/1

# Health predictions
GET /api/patients/1/health-prediction

# Subscription status
GET /api/patients/1/subscription/status
```

## Demo Mode Features

The app runs in demo mode for several integrations:

1. **PayPal Payments**: Simulated subscription flow
2. **Dexcom CGM**: Demo glucose data when API not configured
3. **AI Analysis**: Uses configured Grok AI for real analysis

## Environment Variables (Optional)

For full functionality, you can configure:
- `XAI_API_KEY`: For Grok AI analysis
- `DEXCOM_CLIENT_ID`: For real Dexcom integration
- `DEXCOM_CLIENT_SECRET`: For Dexcom OAuth
- `PAYPAL_CLIENT_ID`: For PayPal payments
- `PAYPAL_CLIENT_SECRET`: For PayPal processing

## Sample Test Data

The app includes pre-loaded test data:
- **Patient**: John Doe (diabetes, hypertension, weight management goals)
- **Provider**: Dr. Sarah Johnson (endocrinologist)
- **Sample messages**: Various communication types
- **Health history**: Simulated health trends and metrics

## Expected Behaviors

1. **AI Features**: Should work with real Grok AI analysis
2. **Dexcom Integration**: Shows connection wizard when not connected
3. **Payments**: Demo mode allows testing without real transactions
4. **File Uploads**: PDF upload validation and processing
5. **Real-time Updates**: Status changes reflect immediately in UI

## Troubleshooting

If you encounter issues:
1. Check browser console for error messages
2. Review server logs in the terminal
3. Use the Dexcom troubleshooting panel for CGM issues
4. Verify file upload limits (5MB for PDFs)

The app is designed to work seamlessly in demo mode while providing hooks for production integrations when API keys are configured.