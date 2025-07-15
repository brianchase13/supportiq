# Project Structure Guide

This document explains the organized folder structure of SupportIQ.

## 📁 Root Directory

### Core Application
- `app/` - Next.js app directory with pages and API routes
- `components/` - React components organized by feature
- `lib/` - Utility libraries and business logic
- `hooks/` - Custom React hooks
- `public/` - Static assets

### Configuration
- `config/` - Configuration files for different services
  - `build/` - Build configuration (Next.js, TypeScript, Tailwind, PostCSS)
  - `database/` - Database schemas and migrations
  - `deployment/` - Deployment configuration (Vercel)
  - `environment/` - Environment setup scripts
  - `linting/` - Linting configuration (ESLint)
  - `stripe/` - Stripe product and price configurations

### Scripts
- `scripts/` - Utility scripts for development and deployment
  - `setup/` - Installation and setup scripts
  - `deployment/` - Deployment automation
  - `testing/` - Test utilities and scripts

### Documentation
- `docs/` - Project documentation
  - `guides/` - User guides and tutorials
  - `api/` - API documentation
  - `deployment/` - Deployment guides
  - `planning/` - Project planning documents
  - `implementation/` - Implementation details

### Root Files (Essential)
- `package.json` - Project dependencies and scripts
- `package-lock.json` - Locked dependency versions
- `README.md` - Project overview and setup guide
- `.gitignore` - Git ignore patterns
- `middleware.ts` - Next.js middleware

## 🗂️ Detailed Structure

### `/app` - Next.js Application
```
app/
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── admin/             # Admin API endpoints
│   ├── ai/                # AI processing endpoints
│   ├── analytics/         # Analytics endpoints
│   ├── deflection/        # Ticket deflection logic
│   ├── intercom/          # Intercom integration
│   ├── stripe/            # Payment processing
│   └── webhooks/          # Webhook handlers
├── dashboard/             # Dashboard pages
├── admin/                 # Admin interface
├── auth/                  # Authentication pages
├── checkout/              # Payment pages
├── demo/                  # Demo mode
├── onboarding/            # User onboarding
├── settings/              # User settings
├── globals.css            # Global styles
├── layout.tsx             # Root layout
└── page.tsx               # Landing page
```

### `/components` - React Components
```
components/
├── ui/                    # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── dashboard/             # Dashboard-specific components
├── auth/                  # Authentication components
├── layout/                # Layout components
├── admin/                 # Admin components
├── analytics/             # Analytics components
├── billing/               # Billing components
├── demo/                  # Demo components
├── intercom/              # Intercom integration
├── landing/               # Landing page components
├── onboarding/            # Onboarding components
├── pricing/               # Pricing components
├── settings/              # Settings components
├── trial/                 # Trial management
└── upload/                # File upload components
```

### `/lib` - Utility Libraries
```
lib/
├── supabase/              # Database utilities
├── auth/                  # Authentication utilities
├── ai/                    # AI processing utilities
├── stripe/                # Payment utilities
├── intercom/              # Intercom integration
├── analytics/             # Analytics utilities
├── billing/               # Billing utilities
├── config/                # Configuration utilities
├── crypto/                # Encryption utilities
├── dashboard/             # Dashboard utilities
├── demo/                  # Demo utilities
├── errors/                # Error handling
├── experts/               # Expert system utilities
├── integrations/          # Third-party integrations
├── launch/                # Launch utilities
├── logging/               # Logging utilities
├── monitoring/            # Monitoring utilities
├── notifications/         # Notification utilities
├── pricing/               # Pricing utilities
├── queue/                 # Queue management
├── rate-limit/            # Rate limiting
├── security/              # Security utilities
├── services/              # Service layer
├── testing/               # Testing utilities
├── testimonials/          # Testimonial system
├── trial/                 # Trial management
├── types/                 # TypeScript types
├── utils/                 # General utilities
├── webhooks/              # Webhook utilities
├── analytics.ts           # Main analytics file
└── utils.ts               # General utilities
```

### `/config` - Configuration Files
```
config/
├── build/                 # Build configuration
│   ├── next.config.ts     # Next.js configuration
│   ├── tsconfig.json      # TypeScript configuration
│   ├── tailwind.config.ts # Tailwind CSS configuration
│   ├── postcss.config.mjs # PostCSS configuration
│   ├── .npmrc            # NPM configuration
│   ├── tsconfig.tsbuildinfo # TypeScript build info
│   └── next-env.d.ts     # Next.js type definitions
├── database/              # Database configuration
│   ├── add-role-column.sql
│   └── ...
├── deployment/            # Deployment configuration
│   ├── vercel.json       # Vercel deployment config
│   └── ...
├── environment/           # Environment setup
├── linting/               # Linting configuration
│   ├── .eslintrc.json    # ESLint configuration
│   ├── eslint.config.mjs # ESLint flat config
│   └── ...
└── stripe/                # Stripe configuration
    ├── create-stripe-products.js
    ├── stripe-prices.json
    └── ...
```

### `/scripts` - Utility Scripts
```
scripts/
├── setup/                 # Setup scripts
│   ├── setup-database.sql
│   ├── setup-intercom.js
│   ├── setup-stripe-webhook.js
│   ├── make-admin-script.js
│   ├── check-setup.js
│   ├── project-structure.md
│   └── ...
├── deployment/            # Deployment scripts
│   ├── deploy-production.sh
│   ├── deploy-env.sh
│   └── ...
└── testing/               # Testing scripts
    ├── run-production-tests.ts
    ├── test-auth-comprehensive.ts
    └── ...
```

### `/docs` - Documentation
```
docs/
├── guides/                # User guides
│   ├── quick-setup.md
│   ├── integration-guides.md
│   ├── SETUP.md
│   └── ...
├── api/                   # API documentation
├── deployment/            # Deployment guides
├── planning/              # Project planning
│   ├── SUPPORTIQ_MEGA_GAMEPLAN.md
│   ├── SUPPORTIQ_TURNAROUND_GAMEPLAN.md
│   ├── VALUE_DELIVERY_SYSTEM.md
│   ├── GAMEPLAN.md
│   ├── BRUTAL_REVIEW_ACTION_PLAN.md
│   └── ...
├── implementation/        # Implementation docs
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── PRODUCTION_LAUNCH_SUMMARY.md
│   ├── REVENUE_SYSTEM_IMPLEMENTATION.md
│   ├── TRIAL_SYSTEM_IMPLEMENTATION.md
│   ├── SUPPORTIQ_COMPLETION_CHECKLIST.md
│   └── ...
├── CONTRIBUTING.md        # Contributing guidelines
├── LICENSE                # Project license
└── LAUNCH_CHECKLIST.md    # Launch checklist
```

## 🔄 Migration Notes

### Moved Files
- **Build Config**: `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs` → `config/build/`
- **Linting Config**: `.eslintrc.json`, `eslint.config.mjs` → `config/linting/`
- **Deployment Config**: `vercel.json` → `config/deployment/`
- **Setup Scripts**: All setup files → `scripts/setup/`
- **Configuration Files**: Stripe and database config → `config/`
- **Documentation**: All docs → `docs/` with subcategories
- **Backup Files**: Removed (cleaned up)

### Root-Level Config Files
- Root config files now act as entry points that reference organized configs
- `tsconfig.json` extends `config/build/tsconfig.json`
- `package.json` updated to reference new config locations

### Benefits of New Structure
1. **Better Organization**: Related files are grouped together
2. **Easier Navigation**: Clear separation of concerns
3. **Scalability**: Easy to add new features and components
4. **Maintainability**: Easier to find and update files
5. **Team Collaboration**: Clear ownership of different areas
6. **Professional Standards**: Follows industry best practices
7. **Clean Root**: Only essential files remain in root directory

## 🚀 Getting Started

1. **For New Developers**: Start with `docs/guides/quick-setup.md`
2. **For API Development**: Check `app/api/` and `docs/api/`
3. **For UI Development**: Look in `components/` and `app/`
4. **For Configuration**: Check `config/` directory
5. **For Deployment**: See `scripts/deployment/` and `docs/deployment/`
6. **For Build Config**: Check `config/build/` directory

## 📝 Best Practices

1. **File Naming**: Use kebab-case for files and folders
2. **Component Organization**: Group by feature, not by type
3. **Documentation**: Keep docs close to the code they describe
4. **Configuration**: Centralize all config in `config/` directory
5. **Scripts**: Organize scripts by purpose (setup, deployment, testing)
6. **Root Directory**: Keep only essential files in root
7. **Config References**: Use root config files as entry points

## 🔧 Configuration Management

### Build Configuration
- **Next.js**: `config/build/next.config.ts`
- **TypeScript**: `config/build/tsconfig.json`
- **Tailwind**: `config/build/tailwind.config.ts`
- **PostCSS**: `config/build/postcss.config.mjs`

### Linting Configuration
- **ESLint**: `config/linting/eslint.config.mjs`
- **Legacy ESLint**: `config/linting/.eslintrc.json`

### Deployment Configuration
- **Vercel**: `config/deployment/vercel.json`
- **Environment**: `config/environment/`

### Service Configuration
- **Stripe**: `config/stripe/`
- **Database**: `config/database/` 