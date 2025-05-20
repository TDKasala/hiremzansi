# ATSBoost: South African CV Optimization Platform

ATSBoost (https://atsboost.co.za) is a resume optimization platform tailored specifically for South African job seekers, addressing the unique requirements of the South African job market while helping to combat the 32% unemployment crisis affecting approximately 15 million people.

## 🚀 Overview

ATSBoost analyzes CVs using advanced AI to provide detailed scoring, recommendations, and improvements based on:

- ATS (Applicant Tracking System) compatibility
- Format and structure analysis 
- Skills assessment
- **South African context evaluation** (B-BBEE status, NQF levels, local regulations, etc.)

The platform follows a freemium business model:
- Free tier: Basic ATS score with minimal recommendations
- Premium tiers: ZAR 30, ZAR 100, and ZAR 200 with increasingly detailed reports and features

## 📋 Key Features

- **CV Analysis**: AI-powered assessment of resume quality with detailed scoring
- **South African Context Detection**: 
  - B-BBEE status recognition (10 points per mention, max 20)
  - NQF level identification (5 points per correct level, max 10)
  - South African cities/provinces detection (2 points each, max 5 per category)
  - Local regulatory knowledge assessment (3 points per mention, max 5)
  - South African languages recognition (3 points per language, max 5)
- **PDF Processing with OCR**: Extract text from scanned PDFs and images using Tesseract.js
- **Personalized Recommendations**: Tailored suggestions to improve CV performance
- **Career Email Digest**: Regular personalized career recommendations via email
- **Job Matching**: AI-powered matching between CVs and job descriptions
- **Mobile-First Design**: Optimized for the 70% of South African users who access via mobile devices

## 🛠️ Technology Stack

### Frontend
- React with TypeScript
- TailwindCSS for styling
- Responsive, mobile-first design

### Backend
- Express.js server
- PostgreSQL database with Drizzle ORM
- AI integration (xAI Grok API)

### Infrastructure
- Optimized for performance (<2s load on 3G, <500KB/page)
- POPIA compliant for data privacy
- PayFast integration for payments

## 📊 CV Analysis Methodology

ATSBoost uses a comprehensive scoring system broken down into three primary categories:

1. **Format Evaluation (40% of total score)**
   - Professional layout and structure
   - Consistent headers and sections
   - Proper use of bullet points
   - Appropriate date formats
   - Readable font and spacing

2. **Skills Assessment (40% of total score)**
   - Relevant technical skills
   - Soft skills
   - Certifications and qualifications
   - Work experience alignment
   - High-demand skills in South Africa weighted 1.5x

3. **South African Context Detection (20% of score)**
   - B-BBEE status mentions
   - NQF levels in qualifications
   - South African locations
   - Local regulatory knowledge
   - South African languages

## 💻 Project Structure

```
/
├── client/              # React frontend
├── server/              # Express backend
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   │   ├── xaiService.ts    # xAI Grok API integration
│   │   ├── atsAnalysisService.ts  # CV analysis logic
│   │   ├── simplePdfParser.ts    # PDF extraction with OCR
│   │   ├── emailService.ts    # Email notifications
│   │   └── recommendationService.ts    # Job recommendations
│   └── utils/           # Utility functions
├── shared/              # Shared types and schemas
└── migrations/          # Database migrations
```

## 🧠 AI Integration

The platform uses xAI's Grok API for advanced CV analysis with special focus on South African context. The AI evaluates:

- Overall ATS compatibility
- Format and structure quality
- Skills relevance and comprehensiveness
- South African context markers (B-BBEE, NQF, etc.)

The system includes robust PDF text extraction with OCR capabilities to ensure accurate analysis of all CV formats, including scanned documents.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 16+
- xAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/atsboost.git
cd atsboost
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=postgresql://user:password@localhost:5432/atsboost
XAI_API_KEY=your_xai_api_key
```

4. Run database migrations
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

## 📝 Usage

### CV Upload and Analysis
1. Users can upload their CV in PDF, DOCX, or TXT format
2. The system extracts text (using OCR for scanned PDFs)
3. The xAI-powered analysis provides a detailed score with breakdown
4. Users receive actionable recommendations for improvement

### South African Context Enhancement
The system specifically looks for South African context markers that can improve a CV's performance in the local job market:
- B-BBEE status information
- NQF qualification levels
- Local regulations knowledge (POPIA, FICA, etc.)
- South African cities and provinces
- Local languages

## 🔒 Privacy and Compliance

ATSBoost adheres to POPIA (Protection of Personal Information Act) compliance for data privacy:
- All user data is securely stored
- Personal information is protected
- Users can request data deletion

## 🤝 Contributing

We welcome contributions to ATSBoost! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- Denis Kasala - Founder and Lead Developer

## 📧 Contact

For any inquiries, please contact us at support@atsboost.co.za