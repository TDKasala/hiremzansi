# Employer Setup Guide - Hire Mzansi

## Overview
This guide explains how employers can set up accounts and start posting jobs on the Hire Mzansi platform.

## Step 1: Create User Account

### Register via API
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "company_admin",
    "email": "admin@company.com",
    "password": "SecurePassword123",
    "name": "Company Administrator"
  }'
```

### Login to Get Session
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePassword123"
  }'
```

## Step 2: Create Employer Profile

Once logged in, create an employer profile:

```bash
curl -X POST http://localhost:5000/api/employers \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie" \
  -d '{
    "companyName": "TechCorp Solutions",
    "industry": "Technology",
    "location": "Cape Town, Western Cape",
    "companySize": "50-100",
    "website": "https://techcorp.co.za",
    "description": "Leading technology solutions provider in South Africa",
    "logo": "https://example.com/logo.png",
    "bbbeeLevel": 2,
    "contactEmail": "hr@techcorp.co.za",
    "contactPhone": "+27 21 123 4567"
  }'
```

## Step 3: Post Your First Job

After creating an employer profile, you can post jobs:

```bash
curl -X POST http://localhost:5000/api/job-postings \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie" \
  -d '{
    "title": "Senior Software Developer",
    "description": "We are seeking an experienced software developer to join our team...",
    "location": "Cape Town, Western Cape",
    "employmentType": "Full-time",
    "experienceLevel": "Senior",
    "salaryRange": "45000-65000",
    "requiredSkills": ["JavaScript", "React", "Node.js", "PostgreSQL"],
    "preferredSkills": ["TypeScript", "AWS", "Docker"],
    "industry": "Technology",
    "deadline": "2024-12-31T23:59:59.000Z",
    "isRemote": false
  }'
```

## Step 4: Manage Job Postings

### View Your Jobs
```bash
curl -X GET http://localhost:5000/api/job-postings/employer/YOUR_EMPLOYER_ID \
  -H "Cookie: your_session_cookie"
```

### Update a Job
```bash
curl -X PATCH http://localhost:5000/api/job-postings/JOB_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie" \
  -d '{
    "salaryRange": "50000-70000",
    "deadline": "2025-01-31T23:59:59.000Z"
  }'
```

### Delete a Job
```bash
curl -X DELETE http://localhost:5000/api/job-postings/JOB_ID \
  -H "Cookie: your_session_cookie"
```

## Authentication Notes

1. **Session-based**: The platform uses session cookies for authentication
2. **Employer verification**: Users must have an employer profile to post jobs
3. **Authorization**: Employers can only manage their own job postings

## Required Fields

### User Registration
- username (unique)
- email (unique)
- password
- name

### Employer Profile
- companyName
- industry
- location

### Job Posting
- title
- description

## Production Deployment

When deploying to production:

1. Replace `localhost:5000` with your production domain
2. Ensure HTTPS is enabled
3. Configure proper session security
4. Set up rate limiting for API endpoints
5. Implement proper error handling and logging

## Frontend Integration

For web-based job posting, integrate with the React frontend:

1. Use the authentication context
2. Create employer profile forms
3. Implement job posting management dashboard
4. Add form validation and error handling

## Support

For technical support or API questions, contact the development team.