# Manual Job Posting Guide

## Quick Start - Post a Job in 3 Steps

### Step 1: Get Authentication Token
First, you need to login and get a session token:

```bash
# Register a new account (if needed)
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "employer_demo",
    "email": "employer@example.com", 
    "password": "SecurePass123",
    "name": "Demo Employer"
  }'

# Login to get session cookie
curl -c cookies.txt -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer@example.com",
    "password": "SecurePass123"
  }'
```

### Step 2: Create Employer Profile
You must have an employer profile before posting jobs:

```bash
curl -b cookies.txt -X POST http://localhost:5000/api/employers \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "TechCorp Solutions",
    "industry": "Technology", 
    "location": "Cape Town, Western Cape",
    "companySize": "50-100",
    "website": "https://techcorp.co.za",
    "description": "Leading tech company in South Africa",
    "contactEmail": "hr@techcorp.co.za",
    "contactPhone": "+27 21 123 4567"
  }'
```

### Step 3: Post Your Job
Now you can create job postings:

```bash
curl -b cookies.txt -X POST http://localhost:5000/api/job-postings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Software Developer",
    "description": "We are seeking an experienced software developer to join our growing team. You will work on exciting projects using modern technologies and contribute to our mission of delivering innovative solutions to South African businesses.",
    "location": "Cape Town, Western Cape",
    "employmentType": "Full-time",
    "experienceLevel": "Senior", 
    "salaryRange": "45000-65000",
    "requiredSkills": ["JavaScript", "React", "Node.js", "PostgreSQL", "Git"],
    "preferredSkills": ["TypeScript", "AWS", "Docker", "Python"],
    "industry": "Technology",
    "deadline": "2024-12-31T23:59:59.000Z"
  }'
```

## Alternative: Using Admin Access

If you have admin credentials, you can create jobs directly:

```bash
# Login as admin
curl -c admin_cookies.txt -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "deniskasala17@gmail.com",
    "password": "@Deniskasala2025"
  }'

# Create job as admin (bypasses employer profile requirement)
curl -b admin_cookies.txt -X POST http://localhost:5000/api/job-postings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Marketing Manager",
    "description": "Lead marketing initiatives for our South African operations...",
    "location": "Johannesburg, Gauteng", 
    "employmentType": "Full-time",
    "experienceLevel": "Mid-level",
    "salaryRange": "35000-50000",
    "requiredSkills": ["Digital Marketing", "SEO", "Social Media"],
    "industry": "Marketing"
  }'
```

## Verify Jobs Were Posted

Check that your jobs appear:

```bash
# List all jobs
curl http://localhost:5000/api/job-postings

# Search specific jobs
curl "http://localhost:5000/api/job-postings?title=Developer"
curl "http://localhost:5000/api/job-postings?location=Cape%20Town"
```

## Job Management

### Update a Job
```bash
curl -b cookies.txt -X PATCH http://localhost:5000/api/job-postings/1 \
  -H "Content-Type: application/json" \
  -d '{
    "salaryRange": "50000-70000",
    "deadline": "2025-01-31T23:59:59.000Z"
  }'
```

### Delete a Job
```bash
curl -b cookies.txt -X DELETE http://localhost:5000/api/job-postings/1
```

### Get Jobs by Employer
```bash
curl -b cookies.txt http://localhost:5000/api/job-postings/employer/YOUR_EMPLOYER_ID
```

## Field Reference

### Required Fields
- `title` - Job title
- `description` - Detailed job description

### Optional Fields  
- `location` - "City, Province" format
- `employmentType` - "Full-time", "Part-time", "Contract", "Internship"
- `experienceLevel` - "Entry", "Junior", "Mid-level", "Senior", "Executive"
- `salaryRange` - "min-max" in ZAR (e.g., "35000-50000")
- `requiredSkills` - Array of required skills
- `preferredSkills` - Array of preferred skills  
- `industry` - Industry category
- `deadline` - Application deadline (ISO date string)

## Troubleshooting

### "Employer profile not found"
You need to create an employer profile first using Step 2 above.

### "Authentication required" 
Make sure you're using the cookies from the login step.

### "Invalid job posting ID"
Check that the job ID exists and you own the job posting.

## Production Deployment

For production deployment:
1. Replace `localhost:5000` with your production domain
2. Use HTTPS endpoints
3. Store session cookies securely
4. Implement proper error handling

The jobs will immediately appear on the Jobs page at http://localhost:5000/jobs once posted successfully.