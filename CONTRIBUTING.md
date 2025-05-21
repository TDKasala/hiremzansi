# Contributing to ATSBoost

Thank you for your interest in contributing to ATSBoost! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [South African Context](#south-african-context)

## Code of Conduct

Our project is dedicated to providing a harassment-free experience for everyone. We expect all contributors to adhere to our Code of Conduct. By participating, you are expected to uphold this code.

- Be respectful and inclusive
- Be patient and welcoming
- Be thoughtful
- Be collaborative
- When we disagree, try to understand why

## Getting Started

### Prerequisites

- Node.js v18 or higher
- PostgreSQL v14 or higher
- Git

### Setup Local Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/atsboost.git
   cd atsboost
   ```

3. Set up your development environment:
   ```bash
   npm install
   ```

4. Create a `.env` file with the required environment variables (see README.md)

5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a branch for your work
2. Make your changes
3. Write or update tests
4. Update documentation
5. Submit a pull request

## Branching Strategy

- `main`: Production-ready code
- `develop`: Development branch, contains features ready for the next release
- `feature/*`: For new features
- `bugfix/*`: For bug fixes
- `hotfix/*`: For urgent fixes to production
- `release/*`: For release preparation

Example: `feature/add-pdf-parsing-enhancement`

## Pull Request Process

1. Update the README.md or relevant documentation with details of changes
2. Ensure all tests pass locally
3. Increase version numbers if applicable (following [SemVer](https://semver.org/))
4. Submit a pull request to the `develop` branch
5. A maintainer will review your PR and provide feedback
6. Once approved, your changes will be merged

### PR Title Format

Please format your PR titles as:
```
[TYPE]: Short description
```

Types:
- `FEAT`: A new feature
- `FIX`: A bug fix
- `DOCS`: Documentation changes
- `STYLE`: Code style changes (formatting, semicolons)
- `REFACTOR`: Code refactoring
- `PERF`: Performance improvements
- `TEST`: Adding or updating tests
- `CHORE`: Maintenance tasks

Example: `FEAT: Add support for Xhosa language translations`

## Coding Standards

We follow these coding standards:

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style in the project
- Use ESLint to ensure code quality
- Format code with Prettier

### React

- Use functional components with hooks
- Keep components small and focused
- Use the shadcn/ui component library when possible
- Follow the file structure of the project

### CSS/Styling

- Use Tailwind CSS for styling
- Follow the design system and color palette
- Ensure responsiveness for mobile devices
- Keep accessibility in mind

## Testing Guidelines

- Write tests for all new features
- Ensure tests cover both success and failure cases
- Make sure existing tests continue to pass
- Tests should be located in the same directory as the code they test

## Documentation

- Update documentation for any changes to APIs, features, or behaviors
- Document any South African specific context in your code
- Include JSDoc comments for functions and components
- Update the API.md file for any API changes

## Reporting Bugs

When reporting bugs, please include:

1. A clear and descriptive title
2. Steps to reproduce the bug
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Your environment (OS, browser, etc.)

## Feature Requests

Feature requests are welcome. Please provide:

1. A clear and descriptive title
2. Detailed description of the feature
3. Any relevant context or screenshots
4. How this feature benefits the South African users of ATSBoost

## South African Context

ATSBoost is specifically designed for the South African job market. When contributing, please:

1. Be aware of South African specific employment regulations and practices
2. Consider B-BBEE (Broad-Based Black Economic Empowerment) requirements
3. Understand the NQF (National Qualifications Framework) levels
4. Be mindful of South Africa's diverse linguistic landscape
5. Consider mobile-first approaches (many South African users access the internet primarily via mobile devices)
6. Understand local job market challenges (32% unemployment rate)

## License

By contributing to this project, you agree that your contributions will be licensed under the project's license (see LICENSE file).

## Questions?

If you have any questions, please contact us at support@atsboost.co.za.

Thank you for contributing to ATSBoost and helping South African job seekers improve their career opportunities!