# SupportIQ 🚀

AI-powered support analytics that cuts ticket costs by 30% through intelligent deflection and automation.

## 🎯 Quick Start

### Automated Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/yourusername/supportiq.git
cd supportiq

# Run automated setup
npm run setup
```

### Manual Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp config/environment/env.example .env.local

# Edit .env.local with your API keys
nano .env.local

# Start development server
npm run dev
```

## 🛠️ Development Tools

### Interactive Development Menu
```bash
npm run tools
```
Access all development tools through an interactive menu:
- 🚀 Start Development Server
- 🧪 Run Tests
- 🔍 Run Linting
- 🏗️ Build Project
- 🗄️ Database Tools
- 💳 Stripe Tools
- 💬 Intercom Tools
- 🔧 Environment Check
- 📊 Bundle Analysis
- 🧹 Clean Project
- 📦 Update Dependencies
- 🔒 Security Audit

### Essential Commands

#### Development
```bash
npm run dev              # Start development server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run clean            # Clean build cache
npm run clean:all        # Clean everything and reinstall
```

#### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
npm run test:all         # Run all tests and checks
```

#### Testing
```bash
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run end-to-end tests
```

#### Database
```bash
npm run db:migrate       # Run database migrations
npm run db:reset         # Reset database
npm run db:types         # Generate TypeScript types
npm run db:studio        # Open Supabase Studio
```

#### Integrations
```bash
npm run stripe:setup     # Setup Stripe products
npm run stripe:webhook   # Setup Stripe webhooks
npm run intercom:setup   # Setup Intercom integration
npm run admin:create     # Create admin user
```

#### Monitoring & Performance
```bash
npm run monitor:performance  # Run performance analysis
npm run analyze             # Analyze bundle size
npm run check:env           # Validate environment
npm run check:health        # Check API health
```

#### Security & Maintenance
```bash
npm run security:audit      # Run security audit
npm run deps:check          # Check for dependency updates
npm run deps:update         # Update all dependencies
```

## 🏗️ Project Structure

```
supportiq/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── ...
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── dashboard/        # Dashboard components
│   └── ...
├── lib/                  # Core libraries
│   ├── ai/              # AI processing
│   ├── analytics/       # Analytics
│   ├── auth/            # Authentication
│   └── ...
├── config/               # Configuration files
│   ├── build/           # Build configs
│   ├── database/        # Database configs
│   ├── environment/     # Environment templates
│   └── ...
├── scripts/              # Automation scripts
│   ├── setup/           # Setup scripts
│   ├── deployment/      # Deployment scripts
│   ├── monitoring/      # Monitoring scripts
│   └── ...
├── docs/                 # Documentation
│   ├── guides/          # Setup guides
│   ├── api/             # API documentation
│   └── ...
└── ...
```

## 🔧 Configuration

### Environment Variables
Copy `config/environment/env.example` to `.env.local` and configure:

#### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key

#### Optional
- `STRIPE_SECRET_KEY` - Stripe secret key
- `INTERCOM_CLIENT_ID` - Intercom client ID
- `RESEND_API_KEY` - Email service API key

### Database Setup
```bash
# Initialize Supabase
npx supabase init

# Start local development
npx supabase start

# Run migrations
npm run db:migrate

# Generate types
npm run db:types
```

## 🚀 Deployment

### Automated Deployment
```bash
# Deploy to production
npm run deploy

# Deploy to staging
npm run deploy:staging
```

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

## 🧪 Testing

### Test Structure
- **Unit Tests**: `__tests__/` directory and `*.test.ts` files
- **E2E Tests**: Playwright tests in `tests/` directory
- **API Tests**: API route tests

### Running Tests
```bash
# All tests
npm run test:all

# Unit tests only
npm run test

# E2E tests only
npm run test:e2e

# With coverage
npm run test:coverage
```

## 📊 Monitoring & Analytics

### Performance Monitoring
```bash
npm run monitor:performance
```
Checks:
- Build size optimization
- Bundle analysis
- Database performance
- API response times
- Memory usage
- Security vulnerabilities
- Test coverage

### Health Checks
```bash
npm run check:health
```

## 🔒 Security

### Security Features
- Environment variable validation
- API rate limiting
- Input sanitization
- CORS configuration
- Security headers
- Dependency vulnerability scanning

### Security Audit
```bash
npm run security:audit
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:all`
5. Submit a pull request

### Code Quality
- Pre-commit hooks run automatically
- ESLint and Prettier configured
- TypeScript strict mode enabled
- Test coverage requirements

## 📚 Documentation

- [Quick Setup Guide](docs/guides/quick-setup.md)
- [Integration Guides](docs/guides/integration-guides.md)
- [API Documentation](docs/api/)
- [Deployment Guide](docs/deployment/)

## 🆘 Support

- **Documentation**: Check the `docs/` directory
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the SupportIQ Team**