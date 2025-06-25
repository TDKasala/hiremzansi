# Manual Job Posting - Step by Step Instructions

## Method 1: Using Command Line (Easiest)

### Step 1: Copy this command and run it in your terminal:

```bash
# Get admin token first
RESPONSE=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "deniskasala17@gmail.com",
    "password": "@Deniskasala2025"
  }')

TOKEN=$(echo $RESPONSE | jq -r '.token')

# Post your job
curl -X POST http://localhost:5000/api/job-postings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "YOUR_JOB_TITLE_HERE",
    "description": "YOUR_JOB_DESCRIPTION_HERE",
    "location": "CITY, PROVINCE",
    "employmentType": "Full-time",
    "salaryRange": "40000-60000",
    "requiredSkills": ["Skill1", "Skill2", "Skill3"],
    "industry": "Technology",
    "companyName": "YOUR_COMPANY_NAME"
  }'
```

### Step 2: Replace the placeholder values:
- `YOUR_JOB_TITLE_HERE` → e.g., "Senior React Developer"
- `YOUR_JOB_DESCRIPTION_HERE` → Full job description
- `CITY, PROVINCE` → e.g., "Cape Town, Western Cape"
- `YOUR_COMPANY_NAME` → Your company name
- Update skills and salary as needed

### Step 3: Run the command
The job will be posted immediately and appear on http://localhost:5000/jobs

## Method 2: Using a REST Client (Postman, Insomnia, etc.)

### Step 1: Get Authentication Token
- **URL**: `POST http://localhost:5000/api/admin/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "deniskasala17@gmail.com",
  "password": "@Deniskasala2025"
}
```
- Copy the `token` from the response

### Step 2: Post Job
- **URL**: `POST http://localhost:5000/api/job-postings`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body**:
```json
{
  "title": "Software Engineer",
  "description": "We are looking for a talented software engineer...",
  "location": "Johannesburg, Gauteng",
  "employmentType": "Full-time",
  "experienceLevel": "Mid-level",
  "salaryRange": "45000-65000",
  "requiredSkills": ["Python", "Django", "PostgreSQL"],
  "preferredSkills": ["AWS", "Docker"],
  "industry": "Technology",
  "companyName": "InnovateTech"
}
```

## Required Fields
- `title` - Job title (string)
- `description` - Job description (string)

## Optional Fields
- `location` - "City, Province" format
- `employmentType` - "Full-time", "Part-time", "Contract", "Internship"
- `experienceLevel` - "Entry", "Junior", "Mid-level", "Senior", "Executive"
- `salaryRange` - "min-max" format (e.g., "40000-60000")
- `requiredSkills` - Array of required skills
- `preferredSkills` - Array of preferred skills
- `industry` - Industry category
- `companyName` - Company name (will create employer profile automatically)

## Quick Examples

### Tech Job:
```bash
curl -X POST http://localhost:5000/api/job-postings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Full Stack Developer",
    "description": "Join our team to build modern web applications",
    "location": "Cape Town, Western Cape",
    "employmentType": "Full-time",
    "salaryRange": "50000-70000",
    "requiredSkills": ["React", "Node.js", "PostgreSQL"],
    "industry": "Technology"
  }'
```

### Marketing Job:
```bash
curl -X POST http://localhost:5000/api/job-postings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Digital Marketing Specialist", 
    "description": "Drive marketing campaigns for South African market",
    "location": "Durban, KwaZulu-Natal",
    "employmentType": "Full-time",
    "salaryRange": "35000-50000",
    "requiredSkills": ["SEO", "Social Media", "Google Analytics"],
    "industry": "Marketing"
  }'
```

## Verify Jobs Were Posted
```bash
curl http://localhost:5000/api/job-postings | jq '.[] | {title: .title, location: .location}'
```

## Troubleshooting
- **"Authentication required"**: Make sure you're using the Bearer token correctly
- **"Employer profile not found"**: The system will create one automatically now
- **Empty response**: Jobs were posted successfully, check the jobs page

The jobs will appear immediately on the frontend at http://localhost:5000/jobs