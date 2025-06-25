# Manual Job Posting - Working Method

## Copy-Paste Commands

**Step 1: Get admin token and post job (modify details as needed):**

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "deniskasala17@gmail.com", "password": "@Deniskasala2025"}' | jq -r '.token')

curl -X POST http://localhost:5000/api/job-postings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "SOFTWARE_DEVELOPER",
    "description": "JOIN_OUR_TEAM_DESCRIPTION",
    "employmentType": "Full-time",
    "experienceLevel": "Mid-level",
    "salaryRange": "45000-65000",
    "requiredSkills": ["JavaScript", "React"],
    "industry": "Technology"
  }'
```

**Step 2: Verify posting worked:**

```bash
curl -s http://localhost:5000/api/job-postings | jq -r '.[] | .title'
```

## Quick Examples

**Tech Job:**
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login -H "Content-Type: application/json" -d '{"email": "deniskasala17@gmail.com", "password": "@Deniskasala2025"}' | jq -r '.token')
curl -X POST http://localhost:5000/api/job-postings -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"title": "React Developer", "description": "Build modern web apps", "employmentType": "Full-time", "salaryRange": "50000-70000", "requiredSkills": ["React", "JavaScript"], "industry": "Technology"}'
```

**Marketing Job:**
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/admin/login -H "Content-Type: application/json" -d '{"email": "deniskasala17@gmail.com", "password": "@Deniskasala2025"}' | jq -r '.token')
curl -X POST http://localhost:5000/api/job-postings -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"title": "Marketing Manager", "description": "Lead digital campaigns", "employmentType": "Full-time", "salaryRange": "40000-60000", "requiredSkills": ["SEO", "Social Media"], "industry": "Marketing"}'
```

## Field Options
- **employmentType**: "Full-time", "Part-time", "Contract", "Internship"
- **experienceLevel**: "Entry", "Junior", "Mid-level", "Senior", "Executive"
- **industry**: "Technology", "Marketing", "Finance", "Healthcare", etc.

Jobs appear immediately at http://localhost:5000/jobs after posting.