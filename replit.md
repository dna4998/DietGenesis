# DNA Diet Club App

## Overview

This is a full-stack health management application designed for the DNA Diet Club, providing personalized diet and exercise plans for patients with a focus on metabolic health. The application serves both patients and healthcare providers with different interfaces for their respective needs.

**Current Status:** Fully functional with patient and provider dashboards, health tracking, and plan management features.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

✓ **Application Successfully Deployed** - User confirmed all features working properly
✓ **Patient Dashboard** - Health metrics, progress tracking, diet/exercise plans, supplements with external links
✓ **Provider Dashboard** - Patient management, plan creation and updates, statistics overview
✓ **Data Model** - Complete schema for patients and providers with health metrics
✓ **Professional Design** - Medical-themed UI with blue/green color scheme
✓ **Sample Data** - Pre-loaded test patients for immediate use
✓ **External Integrations** - YouTube exercise videos and Thorne supplement links
✓ **Fixed TypeScript Issues** - Resolved type compatibility errors in storage layer
✓ **AI-Powered Nutrition Insights** - Integrated Grok AI for personalized nutrition analysis
✓ **AI Meal Planning** - Smart meal plan generation with macro targets and shopping lists
✓ **Provider AI Tools** - Healthcare providers can generate AI insights for patients
✓ **Text-Based Health Assistant** - Smart health questions with text-to-speech responses and quick commands
✓ **AI Exercise Planning** - Complete Grok AI exercise plan generation for patients and providers
✓ **Full Provider AI Suite** - All AI features (insights, meal plans, exercise plans) available on provider dashboard
✓ **Complete Messaging System** - Providers can upload PDFs and share video/PDF links with patients
✓ **File Upload Support** - PDF uploads with 5MB limit and validation
✓ **Link Sharing** - Video and PDF link sharing with URL validation
✓ **Message Management** - Patient messaging dashboard with read/unread status
✓ **Provider Send Interface** - Modal with tabs for text, links, and PDF uploads
✓ **PayPal Subscription System** - Monthly ($4.99) and yearly ($50) subscription plans implemented
✓ **Subscription Management** - Patient dashboard shows subscription status and plan management
✓ **Demo Mode Support** - Payment system works in demo mode without credentials
✓ **Subscription API** - Complete backend API for subscription creation, status tracking, and PayPal integration
✓ **Lab Results Upload** - Providers can upload patient lab results with specialized interface and categorization
✓ **Gut Biome Test Upload** - Dedicated upload system for microbiome analysis and gut health test results
✓ **Enhanced Messaging Types** - Extended messaging system with lab_results and gut_biome_test message types
✓ **Medical Document Management** - Specialized UI for different medical document types with color-coded categories
✓ **AI Plan Generator** - Comprehensive Grok AI system that analyzes lab results and gut biome tests to generate personalized treatment plans
✓ **Provider-Only AI Workflow** - AI functionality restricted to providers for professional medical decision-making
✓ **Simplified Patient Dashboard** - Patient view streamlined to show only demographics and messages from providers
✓ **Automated Plan Distribution** - AI-generated plans automatically sent to patients via messaging system
✓ **Personalized Health Tips Widget** - Daily engaging health content with smart personalization based on patient conditions
✓ **Enhanced Workout Tips** - Comprehensive exercise tips including HIIT, strength training, flexibility, and functional fitness
✓ **Advanced Health Trend Prediction** - Machine learning-powered analytics to predict health trends and risk factors
✓ **Predictive Health Analytics** - Provider dashboard with trend visualization and proactive patient monitoring
✓ **Heart Attack Risk Assessment** - Comprehensive cardiovascular risk scoring based on age, blood pressure, weight, insulin resistance, and lifestyle factors
✓ **Cancer Risk Prediction** - Grok AI-powered cancer risk assessment analyzing demographics, lifestyle factors, and health metrics with personalized prevention recommendations

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Tailwind CSS** with **shadcn/ui** components for styling
- **Wouter** for client-side routing
- **TanStack Query (React Query)** for server state management
- Single-page application with role-based views (patient vs provider)

### Backend Architecture
- **Express.js** server with TypeScript
- RESTful API design with proper error handling
- In-memory storage with plans for database integration
- Built-in request logging and middleware for JSON parsing

### Database Design
- **Drizzle ORM** configured for PostgreSQL
- **Neon Database** integration for serverless PostgreSQL
- Comprehensive schema for patients and providers with health metrics tracking
- Support for diet plans, exercise plans, supplements, and GLP-1 prescriptions

## Key Components

### Data Models
- **Patients**: Complete health profiles including weight, body fat, insulin resistance, blood pressure, and progress tracking
- **Providers**: Healthcare professional profiles with specialty information
- **Messages**: Provider-to-patient communication with support for text, PDF uploads, and external links
- **Health Plans**: Diet plans, exercise routines, supplement protocols, and medication prescriptions

### User Interface Components
- **Patient Dashboard**: Health metrics, progress tracking, personalized plans
- **Provider Dashboard**: Patient management, plan creation and updates
- **Shared Components**: Cards for different health aspects, forms for data entry
- **Medical-themed Design**: Professional color scheme with blue and green accents

### API Structure
- `GET /api/patients` - Retrieve all patients
- `GET /api/patients/:id` - Get specific patient data
- `POST /api/patients` - Create new patient
- `PATCH /api/patients/:id` - Update patient information
- `POST /api/patients/:id/insights` - Generate AI nutrition insights
- `POST /api/patients/:id/meal-plan` - Generate AI meal plans
- `POST /api/patients/:id/exercise-plan` - Generate AI exercise plans
- `POST /api/patients/:id/voice-command` - Process text-based health questions
- `GET /api/voice-commands/suggestions` - Get health command examples
- `GET /api/patients/:id/messages` - Get messages for a patient
- `POST /api/patients/:id/messages/text` - Send text message to patient
- `POST /api/patients/:id/messages/pdf` - Upload PDF file and send to patient
- `POST /api/patients/:id/messages/link` - Send video or PDF link to patient
- `PATCH /api/messages/:id/read` - Mark message as read
- `GET /uploads/:filename` - Serve uploaded PDF files
- `GET /api/paypal/setup` - Get PayPal client token for payments
- `POST /api/paypal/order` - Create PayPal payment order
- `POST /api/paypal/order/:orderID/capture` - Capture PayPal payment
- `POST /api/patients/:id/subscription` - Create subscription for patient
- `GET /api/patients/:id/subscription/status` - Get patient subscription status
- `GET /api/patients/:id/subscription/success` - Handle successful subscription
- `GET /api/patients/:id/subscription/cancel` - Handle cancelled subscription
- `POST /api/patients/:id/messages/lab-results` - Upload lab results PDF for patient
- `POST /api/patients/:id/messages/gut-biome` - Upload gut biome test PDF for patient
- `POST /api/patients/:id/analyze-labs` - AI analysis of patient lab results using Grok
- `POST /api/patients/:id/analyze-gut-biome` - AI analysis of patient gut biome tests using Grok
- `POST /api/patients/:id/generate-comprehensive-plan` - Generate complete treatment plan from AI analysis
- `GET /api/patients/:id/daily-tip` - Get personalized daily health tip based on patient profile
- `GET /api/patients/:id/health-prediction` - Generate advanced health trend predictions using ML algorithms with heart attack and cancer risk assessments

## Data Flow

1. **Patient View**: Patients access their personalized dashboard showing health metrics, progress, and assigned plans
2. **Provider View**: Healthcare providers manage multiple patients, create and update treatment plans
3. **Real-time Updates**: React Query handles data synchronization and caching
4. **Form Validation**: Zod schemas ensure data integrity across the application

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for medical and general UI icons

### Data Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for type safety

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Development
- Vite development server with hot module replacement
- Replit integration with runtime error handling
- TypeScript compilation checking

### Production Build
- Vite builds the client-side React application
- ESBuild bundles the Express server for Node.js deployment
- Static assets served from the Express server

### Database Migration
- Drizzle Kit for database schema management
- PostgreSQL migrations stored in the `/migrations` directory
- Environment variable configuration for database connections

The application is designed to be easily deployable on platforms like Replit, Vercel, or any Node.js hosting service, with the database hosted on Neon or any PostgreSQL provider.