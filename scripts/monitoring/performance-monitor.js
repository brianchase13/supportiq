#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');

class PerformanceMonitor {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      timestamp: new Date().toISOString(),
      checks: {},
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
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

  async checkBuildSize() {
    this.log('📊 Checking build size...', 'info');
    
    try {
      // Build the project
      execSync('npm run build', { stdio: 'pipe' });
      
      // Get build stats
      const buildStats = fs.statSync(path.join(this.projectRoot, '.next'));
      const buildSizeMB = (buildStats.size / (1024 * 1024)).toFixed(2);
      
      this.results.checks.buildSize = {
        status: buildSizeMB < 50 ? 'passed' : buildSizeMB < 100 ? 'warning' : 'failed',
        value: `${buildSizeMB}MB`,
        threshold: '50MB (warning: 100MB)'
      };
      
      this.log(`✅ Build size: ${buildSizeMB}MB`, 'success');
    } catch (error) {
      this.results.checks.buildSize = {
        status: 'failed',
        error: error.message
      };
      this.log(`❌ Build size check failed: ${error.message}`, 'error');
    }
  }

  async checkBundleAnalysis() {
    this.log('📦 Analyzing bundle...', 'info');
    
    try {
      const analysis = execSync('npm run analyze', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      // Parse bundle analysis (simplified)
      const bundleSizeMatch = analysis.match(/Bundle Size: (\d+\.?\d*) KB/);
      if (bundleSizeMatch) {
        const bundleSizeKB = parseFloat(bundleSizeMatch[1]);
        this.results.checks.bundleSize = {
          status: bundleSizeKB < 500 ? 'passed' : bundleSizeKB < 1000 ? 'warning' : 'failed',
          value: `${bundleSizeKB}KB`,
          threshold: '500KB (warning: 1MB)'
        };
        this.log(`✅ Bundle size: ${bundleSizeKB}KB`, 'success');
      }
    } catch (error) {
      this.results.checks.bundleSize = {
        status: 'failed',
        error: error.message
      };
      this.log(`❌ Bundle analysis failed: ${error.message}`, 'error');
    }
  }

  async checkDatabasePerformance() {
    this.log('🗄️  Checking database performance...', 'info');
    
    try {
      // Check database connection and basic queries
      const dbCheck = execSync('npm run check:env', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      if (dbCheck.includes('✅ Database connection')) {
        this.results.checks.database = {
          status: 'passed',
          value: 'Connected and responsive'
        };
        this.log('✅ Database performance: Good', 'success');
      } else {
        this.results.checks.database = {
          status: 'failed',
          value: 'Connection issues detected'
        };
        this.log('❌ Database performance: Issues detected', 'error');
      }
    } catch (error) {
      this.results.checks.database = {
        status: 'failed',
        error: error.message
      };
      this.log(`❌ Database check failed: ${error.message}`, 'error');
    }
  }

  async checkAPIPerformance() {
    this.log('🌐 Checking API performance...', 'info');
    
    try {
      const startTime = Date.now();
      const response = await axios.get('http://localhost:3000/api/health', {
        timeout: 5000
      });
      const responseTime = Date.now() - startTime;
      
      this.results.checks.apiPerformance = {
        status: responseTime < 200 ? 'passed' : responseTime < 500 ? 'warning' : 'failed',
        value: `${responseTime}ms`,
        threshold: '200ms (warning: 500ms)'
      };
      
      this.log(`✅ API response time: ${responseTime}ms`, 'success');
    } catch (error) {
      this.results.checks.apiPerformance = {
        status: 'failed',
        error: error.message
      };
      this.log(`❌ API performance check failed: ${error.message}`, 'error');
    }
  }

  async checkMemoryUsage() {
    this.log('💾 Checking memory usage...', 'info');
    
    try {
      const memUsage = process.memoryUsage();
      const heapUsedMB = (memUsage.heapUsed / (1024 * 1024)).toFixed(2);
      const heapTotalMB = (memUsage.heapTotal / (1024 * 1024)).toFixed(2);
      
      this.results.checks.memoryUsage = {
        status: heapUsedMB < 100 ? 'passed' : heapUsedMB < 200 ? 'warning' : 'failed',
        value: `${heapUsedMB}MB / ${heapTotalMB}MB`,
        threshold: '100MB used (warning: 200MB)'
      };
      
      this.log(`✅ Memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB`, 'success');
    } catch (error) {
      this.results.checks.memoryUsage = {
        status: 'failed',
        error: error.message
      };
      this.log(`❌ Memory check failed: ${error.message}`, 'error');
    }
  }

  async checkDependencies() {
    this.log('📦 Checking dependencies...', 'info');
    
    try {
      const auditResult = execSync('npm audit --json', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const audit = JSON.parse(auditResult);
      const vulnerabilities = audit.metadata?.vulnerabilities || {};
      const totalVulnerabilities = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);
      
      this.results.checks.dependencies = {
        status: totalVulnerabilities === 0 ? 'passed' : totalVulnerabilities < 5 ? 'warning' : 'failed',
        value: `${totalVulnerabilities} vulnerabilities`,
        threshold: '0 vulnerabilities (warning: 5)'
      };
      
      this.log(`✅ Dependencies: ${totalVulnerabilities} vulnerabilities`, 
        totalVulnerabilities === 0 ? 'success' : 'warning');
    } catch (error) {
      this.results.checks.dependencies = {
        status: 'failed',
        error: error.message
      };
      this.log(`❌ Dependency check failed: ${error.message}`, 'error');
    }
  }

  async checkTestCoverage() {
    this.log('🧪 Checking test coverage...', 'info');
    
    try {
      const coverageResult = execSync('npm run test:coverage', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const coverageMatch = coverageResult.match(/All files\s+\|\s+(\d+\.?\d*)%/);
      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        this.results.checks.testCoverage = {
          status: coverage >= 80 ? 'passed' : coverage >= 60 ? 'warning' : 'failed',
          value: `${coverage}%`,
          threshold: '80% (warning: 60%)'
        };
        this.log(`✅ Test coverage: ${coverage}%`, 'success');
      }
    } catch (error) {
      this.results.checks.testCoverage = {
        status: 'failed',
        error: error.message
      };
      this.log(`❌ Test coverage check failed: ${error.message}`, 'error');
    }
  }

  calculateSummary() {
    let passed = 0, failed = 0, warnings = 0;
    
    Object.values(this.results.checks).forEach(check => {
      switch (check.status) {
        case 'passed':
          passed++;
          break;
        case 'failed':
          failed++;
          break;
        case 'warning':
          warnings++;
          break;
      }
    });
    
    this.results.summary = { passed, failed, warnings };
  }

  generateReport() {
    this.log('\n📋 Performance Report', 'info');
    this.log('==================', 'info');
    
    Object.entries(this.results.checks).forEach(([check, data]) => {
      const status = data.status === 'passed' ? '✅' : data.status === 'warning' ? '⚠️' : '❌';
      const color = data.status === 'passed' ? 'success' : data.status === 'warning' ? 'warning' : 'error';
      
      this.log(`${status} ${check}: ${data.value || data.error}`, color);
      if (data.threshold) {
        this.log(`   Threshold: ${data.threshold}`, 'info');
      }
    });
    
    this.log('\n📊 Summary', 'info');
    this.log(`✅ Passed: ${this.results.summary.passed}`, 'success');
    this.log(`⚠️  Warnings: ${this.results.summary.warnings}`, 'warning');
    this.log(`❌ Failed: ${this.results.summary.failed}`, 'error');
    
    // Save report to file
    const reportPath = path.join(this.projectRoot, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    this.log(`\n📄 Report saved to: ${reportPath}`, 'info');
  }

  async run() {
    this.log('🚀 Starting Performance Monitor', 'info');
    this.log('==============================', 'info');
    
    await this.checkBuildSize();
    await this.checkBundleAnalysis();
    await this.checkDatabasePerformance();
    await this.checkAPIPerformance();
    await this.checkMemoryUsage();
    await this.checkDependencies();
    await this.checkTestCoverage();
    
    this.calculateSummary();
    this.generateReport();
  }
}

// Run the performance monitor
const monitor = new PerformanceMonitor();
monitor.run().catch(console.error); 