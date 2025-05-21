# ATSBoost API Documentation

This document provides comprehensive details about the ATSBoost API endpoints, request formats, response structures, and authentication requirements.

## Base URL

All API endpoints are relative to:

```
https://atsboost.co.za/api
```

## Authentication

Most endpoints require authentication. Include session cookies in your requests after logging in.

### Authentication Endpoints

#### Register a New User

```
POST /register
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string"
}
```

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string"
}
```

**Status Codes:**
- `201`: User created successfully
- `400`: Invalid input or username already exists
- `500`: Server error

#### Login

```
POST /login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": "number",
  "username": "string"
}
```

**Status Codes:**
- `200`: Login successful
- `401`: Invalid credentials
- `500`: Server error

#### Logout

```
POST /logout
```

**Response:** Empty with status code 200

#### Get Current User

```
GET /user
```

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string"
}
```

**Status Codes:**
- `200`: Success
- `401`: Not authenticated
- `500`: Server error

## CV Management

### Upload a CV

```
POST /upload
```

**Request:**
- Content-Type: `multipart/form-data`
- Form Fields:
  - `file`: The CV file (PDF, DOCX, DOC)
  - `jobDescription`: (Optional) Job description for targeted analysis

**Response:**
```json
{
  "id": "number",
  "fileName": "string",
  "createdAt": "string",
  "status": "string"
}
```

**Status Codes:**
- `201`: CV uploaded successfully
- `400`: Invalid file format or missing file
- `401`: Not authenticated
- `500`: Server error

### Get CV List

```
GET /cvs
```

**Response:**
```json
[
  {
    "id": "number",
    "fileName": "string",
    "createdAt": "string",
    "status": "string"
  }
]
```

**Status Codes:**
- `200`: Success
- `401`: Not authenticated
- `500`: Server error

### Get Latest CV

```
GET /latest-cv
```

**Response:**
```json
{
  "id": "number",
  "fileName": "string",
  "createdAt": "string",
  "status": "string",
  "fileUrl": "string"
}
```

**Status Codes:**
- `200`: Success
- `401`: Not authenticated
- `404`: No CVs found
- `500`: Server error

### Get Specific CV

```
GET /cv/:id
```

**Response:**
```json
{
  "id": "number",
  "fileName": "string",
  "createdAt": "string",
  "status": "string",
  "fileUrl": "string"
}
```

**Status Codes:**
- `200`: Success
- `401`: Not authenticated
- `404`: CV not found
- `500`: Server error

### Delete CV

```
DELETE /cv/:id
```

**Response:** Empty with status code 200

**Status Codes:**
- `200`: CV deleted successfully
- `401`: Not authenticated
- `404`: CV not found
- `500`: Server error

## Analysis Features

### Analyze CV

```
POST /analyze-cv/:id
```

**Request Body:**
```json
{
  "jobDescription": "string (optional)"
}
```

**Response:**
```json
{
  "status": "string",
  "message": "string",
  "atsScore": {
    "id": "number",
    "score": "number",
    "breakdown": {
      "format": "number",
      "content": "number",
      "keywords": "number",
      "saContext": "number"
    },
    "recommendations": [
      {
        "section": "string",
        "suggestion": "string",
        "priority": "string"
      }
    ]
  }
}
```

**Status Codes:**
- `200`: Analysis completed
- `401`: Not authenticated
- `404`: CV not found
- `500`: Server error

### Get ATS Score

```
GET /ats-score/:cvId
```

**Response:**
```json
{
  "id": "number",
  "cvId": "number",
  "score": "number",
  "breakdown": {
    "format": "number",
    "content": "number",
    "keywords": "number",
    "saContext": "number"
  },
  "recommendations": [
    {
      "section": "string",
      "suggestion": "string",
      "priority": "string"
    }
  ],
  "createdAt": "string"
}
```

**Status Codes:**
- `200`: Success
- `401`: Not authenticated
- `404`: ATS score not found
- `500`: Server error

### Deep Analysis

```
POST /deep-analysis/:cvId
```

**Request Body:**
```json
{
  "jobTitle": "string (optional)",
  "industry": "string (optional)"
}
```

**Response:**
```json
{
  "id": "number",
  "cvId": "number",
  "analysisDate": "string",
  "formatAnalysis": {
    "score": "number",
    "issues": ["string"],
    "suggestions": ["string"]
  },
  "contentAnalysis": {
    "score": "number",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "suggestions": ["string"]
  },
  "saContextAnalysis": {
    "score": "number",
    "bbbeeScore": "number",
    "nqfScore": "number",
    "locationScore": "number",
    "suggestions": ["string"]
  },
  "industryFit": {
    "score": "number",
    "keywordMatch": "number",
    "suggestions": ["string"]
  }
}
```

**Status Codes:**
- `200`: Deep analysis completed
- `401`: Not authenticated
- `402`: Payment required (for non-premium users)
- `404`: CV not found
- `500`: Server error

### Analyze Resume Text

```
POST /analyze-resume-text
```

**Request Body:**
```json
{
  "resumeText": "string",
  "jobDescription": "string (optional)"
}
```

**Response:**
Same as the response for `/analyze-cv/:id`

**Status Codes:**
- `200`: Analysis completed
- `400`: Invalid input
- `401`: Not authenticated
- `500`: Server error

## Subscription Management

### Get Subscription

```
GET /subscription
```

**Response:**
```json
{
  "id": "number",
  "userId": "number",
  "planId": "number",
  "status": "string",
  "startDate": "string",
  "endDate": "string",
  "autoRenew": "boolean",
  "scansUsed": "number",
  "scanLimit": "number"
}
```

**Status Codes:**
- `200`: Success
- `401`: Not authenticated
- `404`: No subscription found
- `500`: Server error

### Get Available Plans

```
GET /plans
```

**Response:**
```json
[
  {
    "id": "number",
    "name": "string",
    "price": "number",
    "currency": "string",
    "interval": "string",
    "features": ["string"],
    "scanLimit": "number"
  }
]
```

**Status Codes:**
- `200`: Success
- `500`: Server error

## South African Profile

### Get SA Profile

```
GET /sa-profile
```

**Response:**
```json
{
  "userId": "number",
  "province": "string",
  "bbbeeLevel": "number",
  "nqfLevel": "number",
  "languages": ["string"],
  "preferredIndustries": ["string"]
}
```

**Status Codes:**
- `200`: Success
- `401`: Not authenticated
- `404`: Profile not found
- `500`: Server error

### Update SA Profile

```
PUT /sa-profile
```

**Request Body:**
```json
{
  "province": "string (optional)",
  "bbbeeLevel": "number (optional)",
  "nqfLevel": "number (optional)",
  "languages": ["string (optional)"],
  "preferredIndustries": ["string (optional)"]
}
```

**Response:**
```json
{
  "userId": "number",
  "province": "string",
  "bbbeeLevel": "number",
  "nqfLevel": "number",
  "languages": ["string"],
  "preferredIndustries": ["string"],
  "updatedAt": "string"
}
```

**Status Codes:**
- `200`: Profile updated successfully
- `401`: Not authenticated
- `500`: Server error

## Quiz and Learning Resources

### Get Quiz Questions

```
GET /quiz/:category
```

**Path Parameters:**
- `category`: Quiz category (e.g., "interview", "technical", "workplace")

**Response:**
```json
{
  "category": "string",
  "questions": [
    {
      "id": "number",
      "question": "string",
      "options": ["string"],
      "correctAnswer": "number",
      "explanation": "string"
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid category
- `500`: Server error

## Miscellaneous

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "string",
  "version": "string",
  "databaseStatus": "string"
}
```

**Status Codes:**
- `200`: Service is healthy
- `500`: Service is experiencing issues

## Error Responses

All API endpoints return errors in a consistent format:

```json
{
  "error": "string",
  "message": "string",
  "details": "object (optional)"
}
```

## Rate Limiting

API requests are subject to rate limiting:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

When rate limit is exceeded, the API will respond with status code `429` and a message indicating when the limit will reset.

## Webhooks

ATSBoost provides webhooks for integrating with your applications. Contact us for webhook implementation details.

## Support

For API support or to report issues, contact:
- support@atsboost.co.za
- API documentation version: 1.0