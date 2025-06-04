# Hire Mzansi - South African Job Marketplace Platform

![Hire Mzansi Logo](generated-icon.png)

## 🚀 Overview

Hire Mzansi is a cutting-edge platform designed to connect South African job seekers with employers through AI-powered career tools. With a 32% unemployment rate affecting approximately 15 million people in South Africa, our platform addresses the critical need for tools that increase job application success rates.

Visit us at [hiremzansi.co.za](https://hiremzansi.co.za)

## ✨ Key Features

- **ATS Score Analysis**: Get a free ATS compatibility score for your CV
- **Deep CV Analysis**: Receive detailed feedback with specific improvement suggestions
- **South African Context Detection**: Identify B-BBEE status, NQF levels, and other SA-specific elements
- **Real-time CV Editor**: Edit your CV and see your ATS score improve in real-time
- **Multi-language Support**: Available in English, isiZulu, Sesotho, Afrikaans, and isiXhosa
- **Skill Gap Analysis**: Identify missing skills based on your target job
- **Interview Practice Tools**: Prepare for interviews with AI-powered practice questions
- **Job Search Integration**: Find relevant job opportunities across top South African job boards

## 💻 Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL
- **AI Services**: OpenAI (with gpt-4o model), xAI's Grok models
- **Internationalization**: i18next for multi-language support
- **Authentication**: Custom auth system with password protection
- **Deployment**: Hosted on Replit

## 🔧 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── i18n/           # Internationalization
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   └── index.tsx       # Application entry point
├── server/                 # Backend Express application
│   ├── api/                # API routes
│   ├── routes/             # Route handlers
│   ├── services/           # Service layer
│   ├── scripts/            # Utility scripts
│   └── index.ts            # Server entry point
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Database schema and types
├── docs/                   # Documentation
├── migrations/             # Database migrations
└── test_data/              # Test data
```

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- API keys for OpenAI and/or xAI (for AI-powered features)

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/atsboost.git
   cd atsboost
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/atsboost
   OPENAI_API_KEY=your_openai_api_key
   XAI_API_KEY=your_xai_api_key
   SESSION_SECRET=random_secret_key
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### Production Setup

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 🧪 Testing

Run the test suite with:
```bash
npm test
```

## 🔒 Security & Compliance

ATSBoost is fully compliant with:
- **POPIA** (Protection of Personal Information Act)
- **GDPR** (General Data Protection Regulation)

We implement the following security measures:
- Encrypted data storage
- Secure authentication
- Regular security audits
- Privacy-focused data handling

## 🌍 Internationalization

Hire Mzansi supports the following languages:
- English (en)
- isiZulu (zu)
- Sesotho (st)
- Afrikaans (af)
- isiXhosa (xh)

## 📊 Pricing Model

Hire Mzansi follows a freemium business model with the following tiers:
- **Free**: Basic ATS score and limited recommendations
- **Basic (R30)**: Deep CV analysis with detailed recommendations
- **Premium (R100)**: Monthly subscription with unlimited CV analyses and premium tools
- **Enterprise (R200)**: Advanced features for professional users and teams

## 👥 Contributing

We welcome contributions to Hire Mzansi! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

For any inquiries, please reach out to:
- support@atsboost.co.za

## 🙏 Acknowledgements

- OpenAI for providing advanced AI capabilities
- xAI for Grok models integration
- All contributors and testers