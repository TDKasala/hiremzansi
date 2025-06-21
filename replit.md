# Hire Mzansi - CV Optimization Platform

## Overview

Hire Mzansi is a comprehensive job marketplace and CV optimization platform specifically designed for the South African market. The platform addresses the 32% unemployment rate by helping job seekers optimize their CVs for Applicant Tracking Systems (ATS) while providing intelligent job matching services with South African context awareness.

## System Architecture

The application follows a modern full-stack architecture:

**Frontend**: React SPA with TypeScript, TailwindCSS, and Shadcn UI components
**Backend**: Express.js REST API with TypeScript  
**Database**: PostgreSQL with Supabase as the hosted database provider
**AI Services**: Primary integration with xAI (Grok models) and OpenAI as fallback
**Authentication**: Session-based authentication with secure cookie management
**Deployment**: Configured for Replit with fallback support for Vercel

The system uses a monolithic architecture with clear separation between client and server code, sharing common types and schemas through a shared directory.

## Key Components

### 1. CV Analysis Engine
- **Primary AI Provider**: xAI Grok-2-1212 model (131K context window)
- **Fallback Provider**: OpenAI GPT-4o
- **Features**: ATS scoring, South African context analysis, B-BBEE compliance assessment
- **File Processing**: Supports PDF, DOCX, DOC, and TXT formats

### 2. Job Matching System
- Intelligent CV-job compatibility analysis
- Skills gap identification with South African market context
- Salary compatibility evaluation
- Cultural fit assessment using local hiring practices

### 3. User Management
- Session-based authentication with password hashing using scrypt
- Role-based access control (user, admin, employer)
- Email verification and password reset functionality
- South African profile extensions (province, B-BBEE status, NQF levels)

### 4. Referral System
- Automatic referral code generation for each user
- Multi-tier reward system with credits and benefits
- Comprehensive tracking and analytics dashboard
- Link sharing with copy-to-clipboard functionality

### 5. Admin Dashboard
- User and content management
- System analytics and performance metrics
- CV analysis statistics and trends
- Referral system oversight

## Data Flow

1. **CV Upload**: User uploads CV via frontend interface
2. **Text Extraction**: Backend processes file and extracts text content
3. **AI Analysis**: xAI Grok analyzes CV with South African context awareness
4. **Results Storage**: Analysis results stored in PostgreSQL database
5. **Display**: Frontend renders results with actionable recommendations

## External Dependencies

### Required Services
- **Supabase**: PostgreSQL database hosting and authentication
- **xAI API**: Primary AI service for CV analysis and job matching
- **OpenAI API**: Fallback AI service for reliability

### Optional Services
- **SendGrid**: Email notifications and newsletters
- **Twilio**: WhatsApp integration for notifications
- **Stripe**: Payment processing for premium features

### Environment Variables
The application requires several environment variables as documented in `.env.example`:
- Database configuration (Supabase)
- AI service API keys (xAI, OpenAI)
- Email service configuration
- Session security secrets

## Deployment Strategy

### Primary: Replit Deployment
- Configured with `.replit` file for Node.js 20 runtime
- PostgreSQL 16 module enabled for database support
- Development server runs on port 5000
- Production build process includes both frontend and backend compilation

### Secondary: Vercel Deployment
- Serverless function architecture
- Static frontend hosting with API routes
- Environment variable configuration through Vercel dashboard
- Optimized for global CDN distribution

### Database Setup
- Supabase project with PostgreSQL backend
- Complete schema available in `supabase-schema.sql`
- Row Level Security (RLS) policies for data protection
- Admin user creation scripts for initial setup

The deployment strategy prioritizes Replit for development and testing, with Vercel as the production deployment target. Both platforms support the full feature set with appropriate configuration.

## Changelog

- June 21, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.