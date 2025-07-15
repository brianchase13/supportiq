# Contributing to SupportIQ

Thank you for your interest in contributing to SupportIQ! We welcome contributions from the community to help make this project better.

## How to Contribute

### 1. Fork the Repository

Fork the repository to your own GitHub account and clone it to your local machine.

```bash
git clone https://github.com/yourusername/supportiq.git
cd supportiq
```

### 2. Set Up Development Environment

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Set up the database:
   ```bash
   npx supabase start
   npx supabase db push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Create a Feature Branch

Create a new branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes

- Follow the existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

### 5. Test Your Changes

Run the test suite to ensure your changes don't break existing functionality:

```bash
npm run test
npm run type-check
npm run lint
```

### 6. Commit Your Changes

Follow conventional commit format:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in component"
git commit -m "docs: update README"
```

### 7. Push and Create Pull Request

Push your changes and create a pull request:

```bash
git push origin feature/your-feature-name
```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use strict mode settings

### React Components

- Use functional components with hooks
- Follow component naming conventions (PascalCase)
- Keep components small and focused
- Use proper prop typing

### API Routes

- Follow RESTful conventions
- Include proper error handling
- Use consistent response formats
- Implement proper authentication checks

### Database

- Use typed database queries
- Implement proper Row Level Security (RLS)
- Follow naming conventions for tables and columns
- Create proper indexes for performance

## Testing

### Unit Tests

Write unit tests for utility functions and components:

```bash
npm run test
```

### Integration Tests

Write integration tests for API routes:

```bash
npm run test:integration
```

### End-to-End Tests

Write E2E tests for critical user flows:

```bash
npm run test:e2e
```

## Security Guidelines

- Never commit sensitive data (API keys, passwords, etc.)
- Use environment variables for configuration
- Implement proper authentication and authorization
- Follow security best practices for data handling

## Performance Guidelines

- Optimize database queries
- Use proper caching strategies
- Implement pagination for large datasets
- Optimize images and assets

## Documentation

- Update README.md if needed
- Add JSDoc comments for functions
- Update API documentation for new endpoints
- Include examples in documentation

## Pull Request Process

1. Ensure your branch is up to date with the main branch
2. Fill out the pull request template completely
3. Include screenshots for UI changes
4. Add reviewers to your pull request
5. Respond to feedback and make necessary changes

## Code Review Guidelines

When reviewing code:

- Check for functionality and correctness
- Verify security considerations
- Ensure proper error handling
- Review performance implications
- Check for proper documentation

## Release Process

1. Update version numbers
2. Update CHANGELOG.md
3. Create a release PR
4. Tag the release
5. Deploy to production

## Getting Help

If you need help with development:

- Check the README.md for setup instructions
- Review existing code for patterns
- Ask questions in GitHub discussions
- Join our Discord community

## Issue Guidelines

When creating issues:

- Use clear, descriptive titles
- Include steps to reproduce bugs
- Provide relevant code snippets
- Add labels for categorization

## Feature Requests

When requesting features:

- Explain the use case
- Provide examples if possible
- Consider implementation complexity
- Discuss with maintainers first

## Code of Conduct

Please be respectful and constructive in all interactions. We're all here to make SupportIQ better together.

---

Thank you for contributing to SupportIQ! 🚀