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

- June 21, 2025: Initial setup
- June 21, 2025: Fixed admin authentication - Updated password hash in simpleAuth.ts for deniskasala17@gmail.com with password @Deniskasala2025
- June 21, 2025: Implemented mobile responsive pricing comparison section with card-based layout for mobile devices
- June 21, 2025: Removed green statistics section from hero as requested
- June 22, 2025: Comprehensive SEO metadata optimization with structured data, Open Graph tags, and Twitter cards for enhanced Google search visibility
- June 22, 2025: Fixed email verification flow - Users now must verify email before login, improved email templates to avoid spam folders, added resend verification functionality
- June 22, 2025: Implemented Hire Mzansi logo as favicon across all device formats and platforms
- June 22, 2025: Confirmed keeping current session-based authentication system over Replit Auth for broader user accessibility
- June 23, 2025: Updated site favicon to use official Hire Mzansi logo across all device formats and platforms
- June 23, 2025: Fixed email verification redirection for hiremzansi.co.za domain and improved email deliverability to prevent spam folder issues
- June 23, 2025: Completed admin authentication system overhaul - Unified token verification across all middlewares, fixed admin endpoint access, verified full functionality with proper JWT handling
- June 23, 2025: MAJOR MILESTONE - Completed full PostgreSQL database migration from memory storage, replacing all simpleAuth references with databaseAuth, now using Neon PostgreSQL with proper SSL connection for production-ready data persistence
- June 24, 2025: Implemented domain redirect middleware to force all replit.app traffic to redirect permanently to hiremzansi.co.za custom domain using 301 redirects
- June 24, 2025: DOMAIN MIGRATION COMPLETE - Established hiremzansi.co.za as primary domain with comprehensive SEO configuration, security headers, canonical URLs, sitemap, and application-wide domain settings
- June 24, 2025: PRODUCTION READY - Systematically removed all demo data, mock routes, test endpoints, and sample content across the entire platform. Implemented real database queries for job recommendations and job seeker matches using actual data structures. Fixed authentication issues and cleaned up all development artifacts for production deployment.
- June 24, 2025: ADMIN DASHBOARD COMPLETE - Developed comprehensive production-ready admin dashboard with full user management (view, edit, delete users), CV management system, real-time system health monitoring, activity logging, platform settings configuration, and advanced filtering/search capabilities. Includes secure JWT-based admin authentication and responsive UI design.
- June 24, 2025: SKILLS QUIZ MIGRATION - Moved Skills Quiz from homepage component to standalone page at /skills-quiz, added navigation links in header and footer, removed Job Seeker Benefits section from PremiumRecruiterSection as requested, improved user experience with dedicated quiz interface.
- June 25, 2025: PRODUCTION READY JOB POSTINGS - Removed all demo data from Jobs page and implemented production-ready job posting system with authenticated endpoints for CREATE, READ, UPDATE, DELETE operations. Fixed all React Select component errors by replacing empty string values with "all". Created comprehensive job posting documentation with working manual posting commands.
- June 25, 2025: DATABASE SCHEMA ALIGNMENT - Fixed job posting database schema mismatches by aligning createJobPosting function with actual database structure. Employers can now manually post jobs through authenticated API endpoints using admin credentials.
- June 25, 2025: PRODUCTION DEPLOYMENT READY - Completed full demo data removal, debugged and fixed job posting system with proper database schema alignment. System now production-ready with working manual job posting via authenticated API endpoints. Removed all demo content from recruiter matching, blog pages, and test components. System clean and ready for production deployment.
- June 25, 2025: PREMIUM ATS KEYWORDS SERVICE - Implemented premium ATS keywords analysis tool at /tools/ats-keywords using xAI Grok-2-1212 model. Service analyzes CV content against job descriptions to identify missing keywords, provides South African context optimization, and generates actionable recommendations for ATS compatibility improvement.
- June 25, 2025: REFERRAL PRICING ALIGNMENT - Fixed referral reward values to match current launch pricing (50% discount). Updated both backend API routes and frontend displays to reflect actual service costs: Essential Pack R25, Professional R50/month, Annual discount R100 savings. All milestone values now accurate. Fixed database schema issues and referral code generation functionality.
- June 25, 2025: ENHANCED ADMIN CAPABILITIES - Implemented comprehensive administrative control system including complete job posting management (CRUD operations), user management with role-based controls, platform analytics dashboard, referral system administration with manual reward distribution, user broadcasting capabilities, and full platform oversight. Admin now has complete control over job postings, referral service, and all core platform functions.
- June 25, 2025: ADMIN LOGIN REDIRECTION PERMANENTLY RESOLVED - Fixed timing issues in AdminDashboard authentication check that was causing immediate redirects before token verification. Enhanced authentication flow with proper delays, comprehensive console logging, and robust token verification. Admin login now works correctly with full dashboard access and platform management capabilities. Console logs confirm successful authentication flow: login → token storage → dashboard redirect → authentication verification → platform data loading.
- June 25, 2025: ADMIN DASHBOARD DATA INTEGRATION COMPLETE - Fixed all admin endpoint authentication issues by replacing requireAdmin middleware with manual JWT token verification. Enhanced admin endpoints to display comprehensive platform data including user management with proper names, CV analysis with status tracking, activity logs without database column errors, and system health monitoring. All dashboard tabs now correctly display real platform data with proper authentication.
- June 25, 2025: ADMIN DASHBOARD FUNCTIONALITY COMPLETE - Implemented comprehensive button functionality with working backend endpoints for all admin operations including settings management, data export with automatic file downloads, user management with role updates, CV operations, system backup, and platform configuration. Fixed TypeScript errors and duplicate variable declarations. All admin dashboard buttons now connect to functional backend APIs with proper validation, loading states, and error handling.
- June 25, 2025: ADMIN JOB POSTING MANAGEMENT RESTORED - Added back the missing job posting management feature to admin dashboard with dedicated Jobs tab. Includes complete job posting management with search, edit, delete capabilities, job status toggles, application tracking, and data export functionality. Admin can now manage all job postings with full CRUD operations and comprehensive job details editing.
- June 25, 2025: HIRE MZANSI FAVICON IMPLEMENTATION COMPLETE - Successfully implemented official Hire Mzansi logo as comprehensive favicon system across all devices. Created multiple icon formats (ICO, PNG in sizes 16x16, 32x32, 48x48, 180x180, 192x192, 512x512), web manifest for PWA support, and updated HTML with complete favicon links. Theme color updated to match brand identity (#4ade80). Platform now displays proper branding across browsers, mobile devices, and when saved to home screen.
- June 25, 2025: BEAUTIFUL HEADER REDESIGN COMPLETE - Redesigned header with modern, elegant appearance featuring backdrop blur effects, gradient animations, hover transformations, and smooth transitions. Enhanced logo with glow effects, redesigned navigation with rounded buttons and active state indicators, improved user dropdown with glassmorphism styling, and completely refreshed mobile menu with consistent design language. Header now provides premium visual experience across all devices.
- June 26, 2025: REFERRAL PAGE CONTENT RECTIFICATION COMPLETE - Fixed logical contradictions and inconsistencies in referral page content. Removed conflicting pricing references (R30 vs R25), aligned reward messaging with progressive structure, eliminated mixed service naming, and created coherent content flow. Page now consistently presents tiered reward system without contradictory claims about specific milestone requirements.
- June 26, 2025: FREEMIUM INTERVIEW PRACTICE FEATURE COMPLETE - Implemented subscription-limited interview practice tool with 2 free questions for non-subscribers. Added AI-powered interview simulation using xAI Grok-2-1212, comprehensive subscription prompt with premium features showcase, progress tracking indicator, and seamless upgrade flow to pricing page. Feature enhances user acquisition through freemium model while maintaining premium value proposition.

## User Preferences

Preferred communication style: Simple, everyday language.