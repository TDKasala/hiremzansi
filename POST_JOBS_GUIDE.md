# Job Posting API Guide - Production Ready

## Overview
This guide explains how to post jobs using the Hire Mzansi backend API. All demo data has been removed - this is the production-ready system.

## Authentication Required
All job posting endpoints require authentication. Employers must be logged in to post jobs.

## Endpoint: POST /api/job-postings

### Headers
```
Content-Type: application/json
Cookie: session_id=your_session_cookie
```

### Request Body
```json
{
  "title": "Senior Full Stack Developer",
  "description": "We are looking for an experienced developer to join our team...",
  "location": "Cape Town, Western Cape",
  "employmentType": "Full-time",
  "experienceLevel": "Senior",
  "salaryRange": "45000-65000",
  "requiredSkills": ["JavaScript", "React", "Node.js", "SQL"],
  "preferredSkills": ["TypeScript", "AWS", "Docker"],
  "industry": "Technology",
  "deadline": "2024-12-31T23:59:59.000Z",
  "isRemote": false
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Job title |
| description | string | Yes | Detailed job description |
| location | string | No | Job location (City, Province format) |
| employmentType | string | No | "Full-time", "Part-time", "Contract", "Internship" |
| experienceLevel | string | No | "Entry", "Junior", "Mid-level", "Senior", "Executive" |
| salaryRange | string | No | Salary range in ZAR (e.g., "45000-65000") |
| requiredSkills | array | No | Array of required skills |
| preferredSkills | array | No | Array of preferred skills |
| industry | string | No | Industry category |
| deadline | string | No | Application deadline (ISO date string) |
| isRemote | boolean | No | Whether the job is remote (default: false) |

### Response

#### Success (201 Created)
```json
{
  "id": 123,
  "employerId": 456,
  "title": "Senior Full Stack Developer",
  "description": "We are looking for an experienced developer...",
  "location": "Cape Town, Western Cape",
  "employmentType": "Full-time",
  "experienceLevel": "Senior",
  "salaryRange": "45000-65000",
  "requiredSkills": ["JavaScript", "React", "Node.js", "SQL"],
  "preferredSkills": ["TypeScript", "AWS", "Docker"],
  "industry": "Technology",
  "deadline": "2024-12-31T23:59:59.000Z",
  "isActive": true,
  "isFeatured": false,
  "isRemote": false,
  "views": 0,
  "applications": 0,
  "createdAt": "2024-06-25T10:30:00.000Z",
  "updatedAt": "2024-06-25T10:30:00.000Z"
}
```

#### Error (400 Bad Request)
```json
{
  "error": "Validation failed",
  "details": {
    "title": "Title is required",
    "description": "Description is required"
  }
}
```

#### Error (401 Unauthorized)
```json
{
  "error": "Authentication required"
}
```

## Example Usage

### Using curl
```bash
curl -X POST http://localhost:5000/api/job-postings \
  -H "Content-Type: application/json" \
  -H "Cookie: your_session_cookie" \
  -d '{
    "title": "Software Engineer",
    "description": "Join our engineering team...",
    "location": "Johannesburg, Gauteng",
    "employmentType": "Full-time",
    "experienceLevel": "Mid-level",
    "salaryRange": "35000-50000",
    "requiredSkills": ["Python", "Django", "PostgreSQL"],
    "industry": "Technology"
  }'
```

### Using JavaScript/Fetch
```javascript
const jobData = {
  title: "Marketing Manager",
  description: "Lead our marketing initiatives...",
  location: "Durban, KwaZulu-Natal",
  employmentType: "Full-time",
  experienceLevel: "Senior",
  salaryRange: "40000-60000",
  requiredSkills: ["Digital Marketing", "SEO", "Analytics"],
  industry: "Marketing"
};

fetch('/api/job-postings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include session cookies
  body: JSON.stringify(jobData)
})
.then(response => response.json())
.then(data => console.log('Job posted:', data))
.catch(error => console.error('Error:', error));
```

## Notes

1. **Authentication**: Users must be logged in and have employer privileges to post jobs
2. **Validation**: All required fields must be provided and meet validation criteria
3. **Auto-generated fields**: `id`, `employerId`, `isActive`, `isFeatured`, `views`, `applications`, `createdAt`, and `updatedAt` are automatically set
4. **Default values**: New jobs are automatically set as active (`isActive: true`) and not featured (`isFeatured: false`)
5. **Employer ID**: Automatically extracted from the authenticated user's session

## Job Management

### Update Job: PUT /api/job-postings/:id
### Delete Job: DELETE /api/job-postings/:id
### Get Jobs by Employer: GET /api/job-postings/employer/:employerId
### Get Single Job: GET /api/job-postings/:id

For detailed documentation on these endpoints, contact the development team.