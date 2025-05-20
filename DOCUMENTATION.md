# ATSBoost Technical Documentation

This document provides detailed technical information about the ATSBoost platform architecture, API endpoints, database schema, and development guidelines.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [AI Integration](#ai-integration)
5. [Authentication and Authorization](#authentication-and-authorization)
6. [File Processing](#file-processing)
7. [South African Context Analysis](#south-african-context-analysis)
8. [Email System](#email-system)
9. [Development Guidelines](#development-guidelines)
10. [Deployment](#deployment)
11. [Testing](#testing)
12. [Performance Considerations](#performance-considerations)

## System Architecture

ATSBoost follows a modern web application architecture:

- **Frontend**: React SPA with TypeScript and TailwindCSS
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with secure sessions
- **File Storage**: Database for CV content, file metadata
- **AI Integration**: xAI Grok API for CV analysis
- **Scheduled Tasks**: Node.js cron jobs for email digests and recommendations

### Data Flow

1. User uploads CV via frontend
2. Backend processes and extracts text (with OCR if needed)
3. AI service analyzes the CV with South African context awareness
4. Analysis results are stored in database
5. Frontend displays analysis results and recommendations

## Database Schema

The system uses PostgreSQL with the following key tables:

### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  name VARCHAR(100),
  profile_picture VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(100),
  reset_token VARCHAR(100),
  reset_token_expires TIMESTAMP,
  subscription_status VARCHAR(20) DEFAULT 'free',
  scans_used INT DEFAULT 0,
  scans_limit INT DEFAULT 1,
  last_scan_reset TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### CVs
```sql
CREATE TABLE cvs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  content TEXT NOT NULL,
  title VARCHAR(100) DEFAULT 'CV',
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  target_position VARCHAR(100),
  target_industry VARCHAR(100),
  job_description TEXT,
  is_guest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ATS Scores
```sql
CREATE TABLE ats_scores (
  id SERIAL PRIMARY KEY,
  cv_id INT REFERENCES cvs(id) ON DELETE CASCADE,
  score INT NOT NULL,
  skills_score INT NOT NULL,
  format_score INT NOT NULL,
  context_score INT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  issues TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### South African Profiles
```sql
CREATE TABLE sa_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  province VARCHAR(50),
  city VARCHAR(50),
  b_bbee_level VARCHAR(20),
  preferred_industries TEXT[] DEFAULT '{}',
  preferred_job_types TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  regulations_knowledge TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Complete ERD Diagram

[Database ERD Diagram](db_erd.png)

## API Endpoints

The API follows REST conventions with the following key endpoints:

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Authenticate user and get token
- `POST /api/logout` - Logout user and invalidate token
- `GET /api/user` - Get current user information

### CV Management
- `POST /api/upload` - Upload a new CV
- `GET /api/cvs` - Get all user CVs
- `GET /api/latest-cv` - Get user's most recent CV
- `PUT /api/cv/:id` - Update CV details
- `DELETE /api/cv/:id` - Delete a CV

### CV Analysis
- `POST /api/analyze-cv/:id` - Analyze CV using xAI
- `GET /api/ats-score/:cvId` - Get CV analysis results
- `POST /api/analyze-resume-text` - Analyze raw CV text

### South African Context
- `PUT /api/sa-profile` - Update South African profile
- `GET /api/sa-profile` - Get user's South African profile
- `GET /api/sa-keywords` - Get list of South African keywords

### Subscriptions and Payments
- `GET /api/plans` - Get available subscription plans
- `POST /api/create-subscription` - Create a new subscription
- `GET /api/subscription` - Get user's current subscription

### Other Services
- `GET /api/health` - Service health check
- `POST /api/test-pdf-extraction` - Test PDF extraction quality
- `POST /api/test-cv-analysis/:id` - Demo CV analysis with SA context

## AI Integration

ATSBoost uses xAI's Grok API for CV analysis with custom prompting for South African context. The integration is handled through the `xaiService.ts` module:

### Implementation Details

```typescript
// xaiService.ts
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

export async function analyzeCV(cvText: string, jobDescription?: string): Promise<AnalysisResponse> {
  // Custom prompt with South African context instructions
  const saContextPrompt = `
    You are an expert ATS analyzer specialized in the South African job market.
    
    Analyze the following CV text with special focus on:
    1. Overall ATS compatibility (0-100)
    2. Format evaluation (40% of total score)
    3. Skills identification (40% of total score)
    4. South African context detection (20% of score):
       - B-BBEE status (10 points per mention, max 20)
       - NQF levels (5 points per level, max 10)
       - South African locations (2 points each, max 5 per category)
       - Local regulatory knowledge (3 points per mention, max 5)
       - South African languages (3 points per language, max 5)
    
    CV TEXT:
    ${cvText}
    
    ${jobDescription ? `Job Description: ${jobDescription}` : ''}
    
    Provide a JSON response with detailed scoring and recommendations.
  `;
  
  const response = await xai.chat.completions.create({
    model: "grok-2-1212",
    messages: [
      { role: "system", content: "You're an ATS expert for South Africa." },
      { role: "user", content: saContextPrompt }
    ],
    response_format: { type: "json_object" }
  });
  
  return {
    success: true,
    result: JSON.parse(response.choices[0].message.content)
  };
}
```

### Fallback Mechanism

The system includes a mock analysis service for testing and development purposes, which simulates the AI responses:

```typescript
// mockXaiService.ts
export async function mockAnalyzeCV(cvText: string, jobDescription?: string): Promise<AnalysisResponse> {
  // Simulated analysis based on text patterns
  const saContext = findSouthAfricanContext(cvText);
  
  // Calculate scores for SA context, skills, format
  // ... scoring logic ...
  
  return {
    success: true,
    result: {
      overall_score: overallScore,
      rating: rating,
      skill_score: skillScore,
      format_score: formatScore,
      sa_score: saScore,
      strengths: strengths,
      improvements: improvements,
      skills_identified: skills,
      south_african_context: {
        b_bbee_mentions: saContext.bbbee,
        nqf_levels: saContext.nqf,
        locations: saContext.locations,
        regulations: saContext.regulations,
        languages: saContext.languages
      }
    }
  };
}
```

## Authentication and Authorization

The system uses Express session-based authentication with PassportJS:

```typescript
// auth.ts
export function setupAuth(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Local strategy for username/password auth
  passport.use(new LocalStrategy(async (username, password, done) => {
    const user = await storage.getUserByUsername(username);
    if (!user || !(await comparePasswords(password, user.password))) {
      return done(null, false);
    }
    return done(null, user);
  }));
  
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });
  
  // Auth route handlers
  // ... login, register, logout routes ...
}
```

### Role-Based Authorization

The system implements middleware for role-based access control:

```typescript
// Middleware for authenticated users only
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
};

// Middleware for admin access
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ error: "Admin access required" });
};

// Middleware for active subscribers
const hasActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const subscription = await storage.getActiveSubscription(req.user.id);
  if (!subscription) {
    return res.status(403).json({ error: "Subscription required" });
  }
  
  next();
};
```

## File Processing

The system handles file uploads and processing with specialized services:

### CV Upload Flow

1. File is uploaded via `multer` middleware
2. File type is detected and appropriate parser is used
3. Text is extracted and stored in the database
4. CV record is created with metadata

### PDF Processing with OCR

For PDF files, the system uses a custom parser with OCR capabilities:

```typescript
// simplePdfParser.ts
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    // First attempt: direct text extraction from PDF buffer
    let extractedText = pdfBuffer.toString('utf-8')
      .replace(/[^\x20-\x7E\r\n]/g, ' ')
      .trim();
    
    // If text extraction yields poor results, use OCR
    if (extractedText.length < 500 || !hasProperTextContent(extractedText)) {
      console.log("Attempting OCR extraction");
      extractedText = await extractTextWithOCR(pdfBuffer);
    }
    
    return processExtractedText(extractedText);
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

async function extractTextWithOCR(pdfBuffer: Buffer): Promise<string> {
  const worker = await Tesseract.createWorker('eng');
  const { data } = await worker.recognize(pdfBuffer);
  await worker.terminate();
  return data.text;
}
```

## South African Context Analysis

The system includes specialized utilities for detecting South African context markers in CVs:

```typescript
// textUtil.ts
export function findSouthAfricanContext(text: string): {
  bbbee: string[],
  nqf: string[],
  locations: string[],
  regulations: string[],
  languages: string[]
} {
  const normalizedText = text.toLowerCase();
  
  // B-BBEE related terms
  const bbbeeTerms = [
    'b-bbee', 'bbbee', 'bee', 'broad-based black economic empowerment',
    'level 1', 'level 2', 'level 3', 'level 4', 'level 5', 
    'level 6', 'level 7', 'level 8'
  ];
  
  // NQF levels and qualifications
  const nqfTerms = [
    'nqf', 'national qualifications framework', 
    'nqf level 1', 'nqf level 2', 'nqf level 3', 'nqf level 4',
    'nqf level 5', 'nqf level 6', 'nqf level 7', 'nqf level 8',
    'nqf level 9', 'nqf level 10', 'saqa'
  ];
  
  // South African cities and provinces
  const locationTerms = [
    'johannesburg', 'cape town', 'durban', 'pretoria', 'bloemfontein',
    'port elizabeth', 'gqeberha', 'east london', 'pietermaritzburg',
    'gauteng', 'western cape', 'eastern cape', 'kwazulu-natal', 'kzn',
    'free state', 'north west', 'northern cape', 'limpopo', 'mpumalanga'
  ];
  
  // South African regulations and legislation
  const regulationTerms = [
    'popia', 'fica', 'protection of personal information act',
    'employment equity', 'ee', 'skills development', 'sda',
    'national credit act', 'consumer protection act'
  ];
  
  // South African languages
  const languageTerms = [
    'afrikaans', 'zulu', 'isizulu', 'xhosa', 'isixhosa',
    'setswana', 'tswana', 'sepedi', 'pedi', 'sesotho', 'sotho',
    'venda', 'tshivenda', 'tsonga', 'xitsonga', 'ndebele', 'isindebele',
    'swati', 'siswati', 'english'
  ];
  
  // Find matches in text
  const findMatches = (terms: string[]): string[] => {
    return terms.filter(term => normalizedText.includes(term.toLowerCase()));
  };
  
  return {
    bbbee: findMatches(bbbeeTerms),
    nqf: findMatches(nqfTerms),
    locations: findMatches(locationTerms),
    regulations: findMatches(regulationTerms),
    languages: findMatches(languageTerms)
  };
}
```

## Email System

The platform includes an email system for notifications and personalized career digests:

```typescript
// emailService.ts
export async function sendCareerDigestEmail(
  user: User,
  recommendations: JobRecommendation[]
): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY not set, email service disabled");
      return false;
    }
    
    const html = generateDigestEmailHtml(user, recommendations);
    
    return await sendEmail({
      to: user.email,
      from: 'notifications@atsboost.co.za',
      subject: 'Your Weekly Career Recommendations',
      html
    });
  } catch (error) {
    console.error("Failed to send career digest email:", error);
    return false;
  }
}

function generateDigestEmailHtml(
  user: User,
  recommendations: JobRecommendation[]
): string {
  // Generate responsive HTML email template with recommendations
  // ...
}
```

## Development Guidelines

### Code Style and Standards

- Follow TypeScript best practices
- Use async/await for asynchronous code
- Document functions with JSDoc comments
- Use meaningful variable and function names

### Error Handling

All API endpoints should use consistent error handling:

```typescript
try {
  // Operation that might fail
} catch (error) {
  console.error("Operation failed:", error);
  return res.status(500).json({
    error: "Error description",
    message: error.message || "An unexpected error occurred"
  });
}
```

### Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `XAI_API_KEY`: xAI API key for CV analysis
- `SESSION_SECRET`: Secret for session cookies
- `SENDGRID_API_KEY`: SendGrid API key for emails
- `PAYFAST_MERCHANT_ID`: PayFast merchant ID
- `PAYFAST_MERCHANT_KEY`: PayFast merchant key

### Dependency Management

- Use npm for package management
- Keep dependencies up to date
- Document new dependencies in package.json

## Deployment

### Production Setup

1. Build frontend and backend
```bash
npm run build
```

2. Start production server
```bash
npm start
```

### Environment Configuration

Production-specific configuration:
- Set `NODE_ENV=production`
- Use secure SSL/TLS connections
- Configure proper CORS settings
- Use production database credentials

### Database Migration

For schema changes, create migration files:
```bash
npm run migration:create my_migration
```

Apply migrations:
```bash
npm run migration:run
```

### Monitoring and Logging

The production environment should implement:
- Error logging and monitoring
- Performance metrics
- Usage statistics
- Automatic error reporting

## Testing

### Backend Tests

Run backend tests:
```bash
npm run test:backend
```

### Frontend Tests

Run frontend tests:
```bash
npm run test:frontend
```

### End-to-End Tests

Run E2E tests:
```bash
npm run test:e2e
```

### Manual Testing

Critical workflows to test manually:
1. CV upload and analysis
2. User registration and login
3. Subscription management
4. PDF text extraction
5. Email delivery

## Performance Considerations

### Optimization Techniques

- Mobile-first approach for 70% of South African users
- Optimized page size (<500KB/page)
- Fast loading times (<2s on 3G)
- Efficient database queries with indexing
- Server-side caching for common queries
- Client-side caching for static assets

### Resource Management

- Optimize CV processing for large files
- Rate limit AI API calls
- Implement background job processing
- Use connection pooling for database
- Implement progressive rendering for large reports

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to contribute to the project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.