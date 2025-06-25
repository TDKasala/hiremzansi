# Simple Job Posting Guide

## Easy Copy-Paste Method

**Step 1**: Copy this entire command block:

```bash
# Get authentication token
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "deniskasala17@gmail.com", "password": "@Deniskasala2025"}' | jq -r '.token')

# Post your job (edit the details below)
curl -X POST http://localhost:5000/api/job-postings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Software Developer",
    "description": "We are seeking a talented software developer to join our team in Cape Town. You will work on exciting projects using modern technologies.",
    "employmentType": "Full-time",
    "experienceLevel": "Mid-level", 
    "salaryRange": "45000-65000",
    "requiredSkills": ["JavaScript", "React", "Node.js"],
    "preferredSkills": ["TypeScript", "PostgreSQL"],
    "industry": "Technology",
    "companyName": "TechCorp SA"
  }'

# Verify job was posted
curl -s http://localhost:5000/api/job-postings | jq -r '.[] | "✓ \(.title) - \(.salaryRange)"'
```

**Step 2**: Edit the job details:
- Change `title` to your job title
- Update `description` with your job description  
- Modify `salaryRange` (format: "min-max")
- Update `requiredSkills` array
- Change `companyName` to your company

**Step 3**: Paste and run in terminal

The job will appear immediately at http://localhost:5000/jobs

## Quick Examples

### Tech Job:
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "deniskasala17@gmail.com", "password": "@Deniskasala2025"}' | jq -r '.token')

curl -X POST http://localhost:5000/api/job-postings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Full Stack Developer",
    "description": "Join our team building modern web applications for South African businesses.",
    "employmentType": "Full-time",
    "salaryRange": "50000-70000",
    "requiredSkills": ["React", "Node.js", "PostgreSQL"],
    "industry": "Technology"
  }'
```

### Marketing Job:
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "deniskasala17@gmail.com", "password": "@Deniskasala2025"}' | jq -r '.token')

curl -X POST http://localhost:5000/api/job-postings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Digital Marketing Manager", 
    "description": "Lead marketing campaigns for the South African market.",
    "employmentType": "Full-time",
    "salaryRange": "40000-60000",
    "requiredSkills": ["SEO", "Social Media", "Google Analytics"],
    "industry": "Marketing"
  }'
```

## Field Options

**employmentType**: "Full-time", "Part-time", "Contract", "Internship"
**experienceLevel**: "Entry", "Junior", "Mid-level", "Senior", "Executive"  
**industry**: "Technology", "Marketing", "Finance", "Healthcare", "Education", etc.

## Verify Jobs
```bash
curl http://localhost:5000/api/job-postings | jq '.[] | {title: .title, salary: .salaryRange}'
```

Jobs appear immediately on the website at /jobs