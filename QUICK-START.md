# ATSBoost Quick Start Guide

This guide will help you quickly set up and run the ATSBoost project locally.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 16+
- API keys for xAI (Grok)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/atsboost.git
cd atsboost

# Install dependencies
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/atsboost

# AI Services
XAI_API_KEY=your_xai_api_key

# Session
SESSION_SECRET=your_session_secret

# Email (optional)
SENDGRID_API_KEY=your_sendgrid_api_key

# Payment (optional)
PAYFAST_MERCHANT_ID=your_payfast_merchant_id
PAYFAST_MERCHANT_KEY=your_payfast_merchant_key
```

## Step 3: Set Up the Database

```bash
# Create the database
psql -c "CREATE DATABASE atsboost;"

# Run migrations
npm run db:push
```

## Step 4: Start the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5000

## Step 5: Test CV Analysis

1. Open the application in your browser
2. Upload a CV file (PDF, DOCX, or TXT)
3. Follow the prompts to analyze the CV

## API Testing Endpoints

For testing the PDF extraction and OCR capabilities:
```
POST /api/test-pdf-extraction
```

For testing the xAI integration without credits:
```
POST /api/test-cv-analysis/:id
```

## Troubleshooting

### Database Connection Issues
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env file
- Ensure database user has proper permissions

### API Key Issues
- Verify XAI_API_KEY in .env file
- Check API key status in xAI dashboard
- Ensure API credits are available

### PDF Extraction Issues
- Install Tesseract dependencies if OCR is not working
- For Unix/Linux: `sudo apt-get install tesseract-ocr`
- For macOS: `brew install tesseract`

## Next Steps

- Check the full [README.md](README.md) for more details
- Review [DOCUMENTATION.md](DOCUMENTATION.md) for technical details
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute to the project

## Getting Help

If you encounter any issues, please:
1. Check the [documentation](DOCUMENTATION.md)
2. Open an issue on GitHub
3. Contact the maintainers at support@atsboost.co.za