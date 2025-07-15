#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class AutoSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.envPath = path.join(this.projectRoot, '.env.local');
    this.envExamplePath = path.join(this.projectRoot, 'config/environment/env.example');
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

  async checkPrerequisites() {
    this.log('🔍 Checking prerequisites...', 'info');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (nodeMajor < 18) {
      this.log(`❌ Node.js 18+ required. Current version: ${nodeVersion}`, 'error');
      return false;
    }
    this.log(`✅ Node.js version: ${nodeVersion}`, 'success');

    // Check npm
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      this.log(`✅ npm version: ${npmVersion}`, 'success');
    } catch (error) {
      this.log('❌ npm not found', 'error');
      return false;
    }

    // Check Git
    try {
      const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
      this.log(`✅ Git version: ${gitVersion}`, 'success');
    } catch (error) {
      this.log('❌ Git not found', 'error');
      return false;
    }

    return true;
  }

  async installDependencies() {
    this.log('📦 Checking dependencies...', 'info');
    
    // Check if node_modules already exists
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      this.log('✅ Dependencies already installed', 'success');
      return true;
    }
    
    this.log('📦 Installing dependencies...', 'info');
    return await this.runCommand('npm install --legacy-peer-deps', 'Installing npm dependencies');
  }

  async setupEnvironment() {
    this.log('🔧 Setting up environment...', 'info');
    
    if (fs.existsSync(this.envPath)) {
      const overwrite = await this.question('⚠️  .env.local already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        this.log('Skipping environment setup', 'warning');
        return true;
      }
    }

    if (!fs.existsSync(this.envExamplePath)) {
      this.log('❌ Environment template not found', 'error');
      return false;
    }

    // Copy environment template
    fs.copyFileSync(this.envExamplePath, this.envPath);
    this.log('✅ Environment template copied to .env.local', 'success');
    
    this.log('📝 Please edit .env.local with your actual values', 'warning');
    this.log('   You can run: npm run check:env to validate your setup', 'info');
    
    return true;
  }

  async setupDatabase() {
    this.log('🗄️  Setting up database...', 'info');
    
    const setupDb = await this.question('Set up Supabase database? (y/N): ');
    if (setupDb.toLowerCase() !== 'y') {
      this.log('Skipping database setup', 'warning');
      return true;
    }

    // Check if Supabase CLI is installed
    try {
      execSync('supabase --version', { stdio: 'ignore' });
    } catch (error) {
      this.log('❌ Supabase CLI not found. Please install it first:', 'error');
      this.log('   npm install -g supabase', 'info');
      return false;
    }

    // Initialize Supabase
    await this.runCommand('npx supabase init', 'Initializing Supabase');
    await this.runCommand('npx supabase start', 'Starting Supabase');
    await this.runCommand('npm run db:migrate', 'Running database migrations');
    await this.runCommand('npm run db:types', 'Generating TypeScript types');

    return true;
  }

  async setupStripe() {
    this.log('💳 Setting up Stripe...', 'info');
    
    const setupStripe = await this.question('Set up Stripe products and webhooks? (y/N): ');
    if (setupStripe.toLowerCase() !== 'y') {
      this.log('Skipping Stripe setup', 'warning');
      return true;
    }

    await this.runCommand('npm run stripe:setup', 'Creating Stripe products');
    await this.runCommand('npm run stripe:webhook', 'Setting up Stripe webhooks');

    return true;
  }

  async setupIntercom() {
    this.log('💬 Setting up Intercom...', 'info');
    
    const setupIntercom = await this.question('Set up Intercom integration? (y/N): ');
    if (setupIntercom.toLowerCase() !== 'y') {
      this.log('Skipping Intercom setup', 'warning');
      return true;
    }

    await this.runCommand('npm run intercom:setup', 'Setting up Intercom integration');

    return true;
  }

  async createAdminUser() {
    this.log('👤 Creating admin user...', 'info');
    
    const createAdmin = await this.question('Create admin user? (y/N): ');
    if (createAdmin.toLowerCase() !== 'y') {
      this.log('Skipping admin user creation', 'warning');
      return true;
    }

    await this.runCommand('npm run admin:create', 'Creating admin user');

    return true;
  }

  async runTests() {
    this.log('🧪 Running tests...', 'info');
    
    const runTests = await this.question('Run test suite? (y/N): ');
    if (runTests.toLowerCase() !== 'y') {
      this.log('Skipping tests', 'warning');
      return true;
    }

    await this.runCommand('npm run test:all', 'Running test suite');

    return true;
  }

  async startDevelopment() {
    this.log('🚀 Starting development server...', 'info');
    
    const startDev = await this.question('Start development server? (y/N): ');
    if (startDev.toLowerCase() !== 'y') {
      this.log('Skipping development server', 'warning');
      return true;
    }

    this.log('Starting development server...', 'info');
    this.log('You can now run: npm run dev', 'info');

    return true;
  }

  async showNextSteps() {
    this.log('\n🎉 Setup completed!', 'success');
    this.log('\n📋 Next steps:', 'info');
    this.log('1. Edit .env.local with your actual API keys', 'info');
    this.log('2. Run: npm run check:env to validate your setup', 'info');
    this.log('3. Run: npm run dev to start development', 'info');
    this.log('4. Visit: http://localhost:3000', 'info');
    this.log('\n📚 Useful commands:', 'info');
    this.log('  npm run dev          - Start development server', 'info');
    this.log('  npm run build        - Build for production', 'info');
    this.log('  npm run test:all     - Run all tests', 'info');
    this.log('  npm run deploy       - Deploy to production', 'info');
    this.log('  npm run db:studio    - Open Supabase Studio', 'info');
    this.log('\n📖 Documentation:', 'info');
    this.log('  docs/guides/quick-setup.md - Quick setup guide', 'info');
    this.log('  docs/guides/integration-guides.md - Integration guides', 'info');
  }

  async run() {
    this.log('🚀 SupportIQ Auto Setup', 'info');
    this.log('========================', 'info');

    try {
      // Check prerequisites
      if (!(await this.checkPrerequisites())) {
        process.exit(1);
      }

      // Install dependencies
      if (!(await this.installDependencies())) {
        process.exit(1);
      }

      // Setup environment
      if (!(await this.setupEnvironment())) {
        process.exit(1);
      }

      // Setup database
      await this.setupDatabase();

      // Setup Stripe
      await this.setupStripe();

      // Setup Intercom
      await this.setupIntercom();

      // Create admin user
      await this.createAdminUser();

      // Run tests
      await this.runTests();

      // Show next steps
      await this.showNextSteps();

    } catch (error) {
      this.log(`❌ Setup failed: ${error.message}`, 'error');
      process.exit(1);
    } finally {
      rl.close();
    }
  }
}

// Run the setup
const setup = new AutoSetup();
setup.run(); 