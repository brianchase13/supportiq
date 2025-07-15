#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class DevTools {
  constructor() {
    this.projectRoot = process.cwd();
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async question(prompt) {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  }

  async runCommand(command, description) {
    try {
      this.log(`🔄 ${description}...`, 'info');
      execSync(command, { stdio: 'inherit', cwd: this.projectRoot });
      this.log(`✅ ${description} completed`, 'success');
      return true;
    } catch (error) {
      this.log(`❌ ${description} failed: ${error.message}`, 'error');
      return false;
    }
  }

  async showMenu() {
    console.clear();
    this.log('🛠️  SupportIQ Development Tools', 'info');
    this.log('================================', 'info');
    this.log('');
    this.log('1.  🚀 Start Development Server', 'info');
    this.log('2.  🧪 Run Tests', 'info');
    this.log('3.  🔍 Run Linting', 'info');
    this.log('4.  🏗️  Build Project', 'info');
    this.log('5.  🗄️  Database Tools', 'info');
    this.log('6.  💳 Stripe Tools', 'info');
    this.log('7.  💬 Intercom Tools', 'info');
    this.log('8.  🔧 Environment Check', 'info');
    this.log('9.  📊 Bundle Analysis', 'info');
    this.log('10. 🧹 Clean Project', 'info');
    this.log('11. 📦 Update Dependencies', 'info');
    this.log('12. 🔒 Security Audit', 'info');
    this.log('0.  Exit', 'info');
    this.log('');
  }

  async handleChoice(choice) {
    switch (choice) {
      case '1':
        await this.startDevServer();
        break;
      case '2':
        await this.runTests();
        break;
      case '3':
        await this.runLinting();
        break;
      case '4':
        await this.buildProject();
        break;
      case '5':
        await this.databaseTools();
        break;
      case '6':
        await this.stripeTools();
        break;
      case '7':
        await this.intercomTools();
        break;
      case '8':
        await this.checkEnvironment();
        break;
      case '9':
        await this.analyzeBundle();
        break;
      case '10':
        await this.cleanProject();
        break;
      case '11':
        await this.updateDependencies();
        break;
      case '12':
        await this.securityAudit();
        break;
      case '0':
        this.log('👋 Goodbye!', 'success');
        process.exit(0);
        break;
      default:
        this.log('❌ Invalid choice. Please try again.', 'error');
    }
  }

  async startDevServer() {
    this.log('🚀 Starting development server...', 'info');
    await this.runCommand('npm run dev', 'Starting development server');
  }

  async runTests() {
    const testType = await this.question('Select test type:\n1. Unit tests\n2. E2E tests\n3. All tests\nChoice: ');
    
    switch (testType) {
      case '1':
        await this.runCommand('npm run test', 'Running unit tests');
        break;
      case '2':
        await this.runCommand('npm run test:e2e', 'Running E2E tests');
        break;
      case '3':
        await this.runCommand('npm run test:all', 'Running all tests');
        break;
      default:
        this.log('❌ Invalid choice', 'error');
    }
  }

  async runLinting() {
    const lintType = await this.question('Select linting type:\n1. Lint only\n2. Lint and fix\n3. Format code\nChoice: ');
    
    switch (lintType) {
      case '1':
        await this.runCommand('npm run lint', 'Running ESLint');
        break;
      case '2':
        await this.runCommand('npm run lint:fix', 'Running ESLint with fixes');
        break;
      case '3':
        await this.runCommand('npm run format', 'Formatting code with Prettier');
        break;
      default:
        this.log('❌ Invalid choice', 'error');
    }
  }

  async buildProject() {
    await this.runCommand('npm run build', 'Building project');
  }

  async databaseTools() {
    this.log('🗄️  Database Tools', 'info');
    const dbChoice = await this.question('Select database action:\n1. Run migrations\n2. Reset database\n3. Generate types\n4. Open Supabase Studio\nChoice: ');
    
    switch (dbChoice) {
      case '1':
        await this.runCommand('npm run db:migrate', 'Running database migrations');
        break;
      case '2':
        await this.runCommand('npm run db:reset', 'Resetting database');
        break;
      case '3':
        await this.runCommand('npm run db:types', 'Generating TypeScript types');
        break;
      case '4':
        await this.runCommand('npm run db:studio', 'Opening Supabase Studio');
        break;
      default:
        this.log('❌ Invalid choice', 'error');
    }
  }

  async stripeTools() {
    this.log('💳 Stripe Tools', 'info');
    const stripeChoice = await this.question('Select Stripe action:\n1. Setup products\n2. Setup webhooks\nChoice: ');
    
    switch (stripeChoice) {
      case '1':
        await this.runCommand('npm run stripe:setup', 'Setting up Stripe products');
        break;
      case '2':
        await this.runCommand('npm run stripe:webhook', 'Setting up Stripe webhooks');
        break;
      default:
        this.log('❌ Invalid choice', 'error');
    }
  }

  async intercomTools() {
    this.log('💬 Intercom Tools', 'info');
    await this.runCommand('npm run intercom:setup', 'Setting up Intercom integration');
  }

  async checkEnvironment() {
    await this.runCommand('npm run check:env', 'Checking environment configuration');
  }

  async analyzeBundle() {
    await this.runCommand('npm run analyze', 'Analyzing bundle size');
  }

  async cleanProject() {
    const cleanType = await this.question('Select clean type:\n1. Clean cache only\n2. Clean all (including node_modules)\nChoice: ');
    
    switch (cleanType) {
      case '1':
        await this.runCommand('npm run clean', 'Cleaning cache');
        break;
      case '2':
        await this.runCommand('npm run clean:all', 'Cleaning all');
        break;
      default:
        this.log('❌ Invalid choice', 'error');
    }
  }

  async updateDependencies() {
    const updateType = await this.question('Select update type:\n1. Check for updates\n2. Update all dependencies\nChoice: ');
    
    switch (updateType) {
      case '1':
        await this.runCommand('npm run deps:check', 'Checking for dependency updates');
        break;
      case '2':
        await this.runCommand('npm run deps:update', 'Updating all dependencies');
        break;
      default:
        this.log('❌ Invalid choice', 'error');
    }
  }

  async securityAudit() {
    await this.runCommand('npm run security:audit', 'Running security audit');
  }

  async run() {
    while (true) {
      await this.showMenu();
      const choice = await this.question('Enter your choice: ');
      await this.handleChoice(choice);
      
      if (choice !== '0') {
        await this.question('\nPress Enter to continue...');
      }
    }
  }
}

// Run the dev tools
const devTools = new DevTools();
devTools.run().catch(console.error); 