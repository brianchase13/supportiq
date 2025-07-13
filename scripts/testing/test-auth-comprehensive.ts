#!/usr/bin/env tsx

import { AuthTestSuite } from '@/lib/testing/auth-test-utils';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function runComprehensiveAuthTest() {
  console.log('🚀 Starting comprehensive authentication testing...\n');

  const authTest = new AuthTestSuite();

  try {
    // Test the complete authentication flow
    const { results: authResults, summary: authSummary } = await authTest.testAuthFlow();
    console.log(`\n${authSummary}\n`);

    // Test critical pages that require authentication
    const criticalPages = [
      '/dashboard',
      '/dashboard/profile',
      '/dashboard/analytics',
      '/dashboard/deflection',
      '/dashboard/knowledge-base',
      '/insights',
      '/settings'
    ];

    const { results: pageResults, summary: pageSummary } = await authTest.testPageAccess(criticalPages);
    console.log(`\n${pageSummary}\n`);

    // Generate comprehensive report
    const report = authTest.generateTestReport(authResults, pageResults);
    
    // Save report to file
    const reportPath = join(process.cwd(), 'auth-test-report.md');
    writeFileSync(reportPath, report);
    console.log(`📄 Test report saved to: ${reportPath}`);

    // Display quick summary
    const authPassed = authResults.every(r => r.success);
    const pagePassed = pageResults.every(r => r.success);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Authentication Flow: ${authPassed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Page Access Control: ${pagePassed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Overall Status: ${authPassed && pagePassed ? '🟢 HEALTHY' : '🔴 NEEDS ATTENTION'}`);
    
    if (!authPassed || !pagePassed) {
      console.log('\n🚨 ISSUES DETECTED:');
      [...authResults, ...pageResults]
        .filter(r => !r.success)
        .forEach(r => console.log(`  • ${r.message}`));
    }

    // Cleanup
    await authTest.cleanupTestUsers();
    console.log('\n✅ Test cleanup completed');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runComprehensiveAuthTest()
    .then(() => {
      console.log('\n🎉 Authentication testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test suite crashed:', error);
      process.exit(1);
    });
}

export { runComprehensiveAuthTest };