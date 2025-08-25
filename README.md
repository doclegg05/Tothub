<<<<<<< HEAD
# Tothub
Daycare website
=======
# TotHub - Daycare Management Platform

[![CI Lint](https://github.com/your-username/tothub/actions/workflows/ci.yml/badge.svg?branch=main&event=pull_request)](https://github.com/your-username/tothub/actions/workflows/ci.yml)
[![CI Type Check](https://github.com/your-username/tothub/actions/workflows/ci.yml/badge.svg?branch=main&event=pull_request)](https://github.com/your-username/tothub/actions/workflows/ci.yml)
[![CI Test](https://github.com/your-username/tothub/actions/workflows/ci.yml/badge.svg?branch=main&event=pull_request)](https://github.com/your-username/tothub/actions/workflows/ci.yml)
[![CI Build](https://github.com/your-username/tothub/actions/workflows/ci.yml/badge.svg?branch=main&event=pull_request)](https://github.com/your-username/tothub/actions/workflows/ci.yml)
[![CI Security](https://github.com/your-username/tothub/actions/workflows/ci.yml/badge.svg?branch=main&event=pull_request)](https://github.com/your-username/tothub/actions/workflows/ci.yml)

A comprehensive daycare management platform with biometric authentication, compliance tracking, and real-time monitoring capabilities.

## 🚀 Features

- **Biometric Authentication** - Secure check-ins with fingerprint and facial recognition
- **Compliance Tracking** - Stay compliant with state regulations and licensing requirements
- **Real-time Monitoring** - Live attendance tracking and instant notifications
- **Analytics & Reporting** - Comprehensive insights into daycare operations
- **Multi-location Support** - Manage multiple daycare centers from one platform
- **Mobile Responsive** - Access from any device, anywhere

## 🏗️ Architecture

This repository contains multiple applications and services:

- **`tothub/`** - Main TotHub application (existing)
- **`apps/website/`** - Marketing website built with Next.js 14
- **`server/`** - Backend API services
- **`shared/`** - Shared types and utilities

## 🛠️ Technology Stack

### Main Application
- **Frontend**: React with TypeScript
- **Backend**: Node.js/Express
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Custom auth system with MFA

### Website
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Content**: MDX support
- **Testing**: Playwright

## 📦 Installation

### Prerequisites
- Node.js 18+
- pnpm package manager
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/tothub.git
cd tothub

# Install dependencies
pnpm install

# Start development servers
pnpm dev          # Start website
pnpm dev:app      # Start main app (if available)
```

## 🧪 Development

### Available Scripts

#### Root Level (Workspace)
```bash
# Website development
pnpm dev                    # Start website dev server
pnpm build:website         # Build website for production
pnpm test                  # Run website tests
pnpm lint                  # Run website linting
pnpm typecheck            # Run website type checking

# Security
pnpm audit                 # Security audit
pnpm audit:fix            # Fix security vulnerabilities
```

#### Website Directory
```bash
cd apps/website

# Development
pnpm dev                   # Start development server
pnpm build                 # Build for production
pnpm start                 # Start production server

# Testing
pnpm test                  # Run all tests
pnpm test:ui              # Run tests with UI
pnpm test:headed          # Run tests in headed mode

# Code Quality
pnpm lint                  # Run ESLint
pnpm typecheck            # Run TypeScript check
```

### Testing
```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:website         # Website tests only
pnpm test:ui              # Tests with UI
pnpm test:headed          # Tests in headed mode
```

## 🚀 Deployment

### Website Deployment
The website is configured for easy deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Set root directory to `apps/website`
3. Deploy automatically on push to main branch

See [apps/website/DEPLOYMENT.md](apps/website/DEPLOYMENT.md) for detailed instructions.

### Main Application Deployment
See [tothub/DEPLOYMENT.md](tothub/DEPLOYMENT.md) for main application deployment.

## 🔒 Security

- **Data Encryption**: AES-256 encryption for data at rest and in transit
- **Authentication**: Multi-factor authentication support
- **Compliance**: SOC 2 Type II, HIPAA, GDPR, COPPA compliant
- **Security Headers**: Comprehensive security headers configuration
- **Regular Audits**: Automated security vulnerability scanning

## 📊 CI/CD Pipeline

Our CI pipeline runs on every pull request and includes:

- **Linting** - ESLint code quality checks
- **Type Checking** - TypeScript compilation validation
- **Testing** - Playwright test suite execution
- **Building** - Production build verification
- **Security Audit** - Dependency vulnerability scanning

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes
4. **Test** your changes thoroughly
5. **Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use ESLint for code quality
- Write comprehensive tests
- Update documentation as needed
- Follow conventional commit messages

### Testing Requirements

- All new features must include tests
- Maintain test coverage above 80%
- Run tests locally before submitting PRs
- Ensure CI pipeline passes

## 📚 Documentation

- [Website Implementation Summary](WEBSITE_IMPLEMENTATION_SUMMARY.md)
- [Main Application README](tothub/README.md)
- [Website Documentation](apps/website/README.md)
- [Deployment Guide](apps/website/DEPLOYMENT.md)
- [API Documentation](docs/openapi.yaml)

## 🐛 Issue Reporting

When reporting issues, please include:

- **Environment**: OS, Node.js version, pnpm version
- **Steps to reproduce**: Clear, step-by-step instructions
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Screenshots**: If applicable
- **Logs**: Any error messages or logs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the docs first
- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: Use GitHub Discussions for questions
- **Email**: support@tothub.com (if available)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Playwright for the excellent testing tools
- All contributors and users of TotHub

---

**Note**: Replace `your-username` in the badge URLs with your actual GitHub username when setting up the repository.
>>>>>>> 85be053 (feat: Add comprehensive CI/CD pipeline, gitignore, and branch protection setup)
