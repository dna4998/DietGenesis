# DNA Diet Club App

## Overview

This is a full-stack health management application designed for the DNA Diet Club, providing personalized diet and exercise plans for patients with a focus on metabolic health. The application serves both patients and healthcare providers with different interfaces for their respective needs.

## User Preferences

Preferred communication style: Simple, everyday language.

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