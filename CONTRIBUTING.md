# Contributing to ATSBoost

Thank you for your interest in contributing to ATSBoost! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Development Workflow](#development-workflow)
5. [Pull Request Process](#pull-request-process)
6. [Coding Standards](#coding-standards)
7. [Testing](#testing)
8. [Documentation](#documentation)
9. [Community](#community)

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in our community.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- Git

### Setting Up Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/atsboost.git
   cd atsboost
   ```
3. Add the original repository as a remote:
   ```bash
   git remote add upstream https://github.com/original-owner/atsboost.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Set up environment variables (see [QUICK-START.md](QUICK-START.md))
6. Set up the database:
   ```bash
   npm run db:push
   ```
7. Start the development server:
   ```bash
   npm run dev
   ```

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in the [Issues](https://github.com/yourusername/atsboost/issues)
2. If not, create a new issue with:
   - A clear title
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, etc.)

### Suggesting Enhancements

1. Check if the enhancement has already been suggested
2. If not, create a new issue with:
   - A clear title
   - Detailed description of the enhancement
   - Rationale (why this would be valuable)
   - Possible implementation approach (optional)

### Your First Contribution

Look for issues labeled with `good-first-issue` or `help-wanted`. These are specifically curated for new contributors.

## Development Workflow

1. Create a new branch for your contribution:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/your-bug-fix
   ```

2. Make your changes with clear, atomic commits:
   ```bash
   git commit -m "Clear description of your change"
   ```

3. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request from your branch to the main repository

## Pull Request Process

1. Ensure your code passes all tests
2. Update documentation where necessary
3. Add or update tests for your changes
4. Fill in the pull request template with all required information
5. Request review from maintainers
6. Address any feedback from reviewers
7. Once approved, a maintainer will merge your PR

## Coding Standards

### TypeScript/JavaScript

- Follow the existing code style (ESLint configuration)
- Use meaningful variable and function names
- Comment complex code sections
- Use TypeScript interfaces and types for all data structures
- Avoid any `any` types if possible

### React

- Use functional components with hooks
- Keep components focused and small
- Use TypeScript for props and state
- Follow the component folder structure

### CSS/Styling

- Use TailwindCSS utility classes
- Follow mobile-first approach
- Ensure accessibility (WCAG compliance)

### South African Context

- Be mindful of South African standards and terminology
- Use appropriate South African examples where applicable
- Follow local regulations references (POPIA, B-BBEE, etc.)

## Testing

- Write tests for all new features
- Ensure all tests pass before submitting a PR:
  ```bash
  npm run test
  ```
- Include both unit and integration tests where appropriate
- For UI components, include visual regression tests

## Documentation

- Update documentation for all new features and changes
- Document APIs with JSDoc comments
- Keep the README.md up to date
- Add examples for complex features

## South African Specific Contributions

We especially welcome contributions that enhance the South African context detection and analysis:

- Improved B-BBEE recognition patterns
- More comprehensive NQF level detection
- Additional South African regulations and standards
- Updates to location and language recognition
- Improvements to South African job market insights

## Community

- Join our [Slack/Discord] channel for discussions
- Participate in issue discussions
- Help answer questions from other contributors
- Share the project with others who might be interested

---

Thank you for contributing to ATSBoost, helping to address South Africa's unemployment crisis through better CV optimization!