# ATSBoost Architecture Documentation

This document outlines the architectural design of the ATSBoost platform, detailing the system components, data flow, and technical decisions made during development.

## System Overview

ATSBoost is a full-stack web application designed to help South African job seekers optimize their CVs for Applicant Tracking Systems (ATS). The application follows a client-server architecture with React on the frontend and Express.js on the backend.

![Architecture Diagram](../docs/architecture-diagram.png)

## Core Components

### 1. Frontend (React + TypeScript)

The frontend is built with React and TypeScript, implementing a component-based architecture for UI elements.

#### Key Frontend Components:

- **Authentication System**: Secure login, registration, and session management
- **CV Upload & Management**: File upload handling with progress indicators
- **ATS Score Dashboard**: Visualization of CV scores and metrics
- **Real-time CV Editor**: Interactive editor with real-time ATS scoring
- **Profile Management**: User profile and South African-specific information
- **Internationalization**: Support for multiple South African languages

#### State Management:

- React Context API for global state
- React Query for server state and data fetching
- Custom hooks for reusable logic

### 2. Backend (Express.js + TypeScript)

The backend is an Express.js application written in TypeScript, structured to handle authentication, file processing, and AI-powered analysis.

#### Key Backend Components:

- **Authentication Service**: User authentication and authorization
- **CV Processing Service**: Handles CV uploads, storage, and retrieval
- **ATS Analysis Engine**: Core business logic for CV analysis
- **South African Context Service**: Specialized analysis for SA job market
- **AI Integration Layer**: Integration with OpenAI and xAI
- **Subscription Management**: Handling of premium features and payments

### 3. Database (PostgreSQL)

PostgreSQL is used for data persistence with a schema designed to support the application's features.

#### Key Data Models:

- **Users**: User account information
- **CVs**: Uploaded CV metadata and references
- **ATS Scores**: Analysis results and recommendations
- **SA Profiles**: South Africa-specific user information
- **Subscriptions**: Payment and subscription information
- **Referrals**: Tracking of user referrals

### 4. AI Services

The application leverages multiple AI services for CV analysis:

- **OpenAI Integration**: Using GPT-4o for advanced CV analysis
- **xAI Integration**: Using Grok models as an alternative/fallback
- **Local Analysis Engine**: Rule-based analysis for basic scoring
- **Fallback Mechanism**: Multi-tier approach for reliability

## Data Flow

### 1. CV Upload & Analysis Flow

```
User → Upload CV → File Storage → PDF/DOCX Parser → Text Extraction 
→ AI Analysis → ATS Score Generation → Database Storage → User Dashboard
```

### 2. Authentication Flow

```
User → Login Credentials → Auth Validation → JWT/Session Generation 
→ Protected Routes Access
```

### 3. Subscription Flow

```
User → Select Plan → Payment Processing → Subscription Record Creation 
→ Feature Access Update
```

## Technical Decisions

### 1. Technology Stack Selection

- **React + TypeScript**: For strong typing and component-based UI development
- **Express.js**: For a lightweight, flexible backend
- **PostgreSQL**: For relational data with ACID compliance
- **Tailwind CSS**: For rapid UI development with consistent styling
- **Shadcn/UI**: For accessible, customizable UI components

### 2. API Design

- RESTful API design for simplicity and broad compatibility
- Consistent endpoint naming and response formatting
- Comprehensive error handling and status codes
- Authentication via token-based sessions

### 3. Performance Optimizations

- Client-side caching with React Query
- Server-side response caching for common requests
- Optimized PDF parsing for quick text extraction
- Lazy loading of components and assets
- Image optimization for South African mobile networks

### 4. Security Considerations

- POPIA compliance measures throughout
- Secure password hashing with bcrypt
- CSRF protection
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure file upload handling

### 5. Scalability Approach

- Stateless backend design for horizontal scaling
- Database connection pooling
- Efficient query optimization
- Separation of concerns for maintainability

## South African Specific Considerations

### 1. Mobile-First Design

70% of South African internet users access the web via mobile devices, so the application is designed with mobile-first principles.

### 2. Low-Bandwidth Optimization

- Minimal asset sizes (<500KB per page)
- Progressive loading of content
- Offline capabilities where possible
- Fast initial load times (<2s on 3G)

### 3. Multilingual Support

Support for major South African languages:
- English
- isiZulu
- Sesotho
- Afrikaans
- isiXhosa

### 4. Local Job Market Integration

- B-BBEE score recognition and optimization
- NQF level identification and formatting
- South African industry sector classification
- Provincial targeting for job recommendations

## Testing Strategy

- **Unit Testing**: Individual component and function testing
- **Integration Testing**: API endpoint and service interaction testing
- **End-to-End Testing**: Complete user flow testing
- **Performance Testing**: Load and stress testing under various conditions
- **Localization Testing**: Testing of multilingual features

## Monitoring and Logging

- Application performance monitoring
- Error tracking and reporting
- User behavior analytics
- API usage statistics
- Server health metrics

## Deployment Architecture

- Containerized deployment for consistency
- CI/CD pipeline for automated testing and deployment
- Environment-specific configurations
- Database migration strategy
- Backup and disaster recovery planning

## Future Architectural Considerations

- Microservices migration for specific components
- Enhanced AI model training with South African CV datasets
- Real-time collaboration features
- Integration with more South African job boards
- Advanced analytics and reporting capabilities

## Architecture Decision Records (ADRs)

1. **ADR-001**: Selection of PostgreSQL over NoSQL options
2. **ADR-002**: Implementation of multi-tier AI fallback system
3. **ADR-003**: Mobile-first optimization strategy
4. **ADR-004**: Multilingual implementation approach
5. **ADR-005**: PDF parsing technology selection

For detailed ADRs, see the `/docs/adrs/` directory.