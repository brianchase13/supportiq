import { TestResult, TestSuite } from '@/lib/types';
import { log } from '@/lib/logging/logger';

// Comprehensive testing framework - EVERY FUNCTION NEEDS TESTS
export class TestFramework {
  private tests: Map<string, () => Promise<TestResult>> = new Map();
  private suites: Map<string, TestSuite> = new Map();

  // Register a test
  registerTest(name: string, testFn: () => Promise<TestResult>): void {
    this.tests.set(name, testFn);
  }

  // Register a test suite
  registerSuite(name: string, tests: string[]): void {
    this.suites.set(name, {
      name,
      tests: [],
      total_tests: tests.length,
      passed_tests: 0,
      failed_tests: 0,
      duration_ms: 0,
      timestamp: new Date().toISOString(),
    });
  }

  // Run a single test
  async runTest(testName: string): Promise<TestResult> {
    const testFn = this.tests.get(testName);
    if (!testFn) {
      throw new Error(`Test "${testName}" not found`);
    }

    const startTime = Date.now();
    let result: TestResult;

    try {
      result = await testFn();
      result.duration_ms = Date.now() - startTime;
      
      if (result.passed) {
        log.info(`Test passed: ${testName}`, {
          test_name: testName,
          duration_ms: result.duration_ms,
        });
      } else {
        log.warn(`Test failed: ${testName}`, {
          test_name: testName,
          error: result.error,
          duration_ms: result.duration_ms,
        });
      }
    } catch (error) {
      result = {
        test_name: testName,
        passed: false,
        duration_ms: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
        details: { exception: error },
      };
      
      log.error(`Test error: ${testName}`, error as Error, {
        test_name: testName,
        duration_ms: result.duration_ms,
      });
    }

    return result;
  }

  // Run a test suite
  async runSuite(suiteName: string): Promise<TestSuite> {
    const suite = this.suites.get(suiteName);
    if (!suite) {
      throw new Error(`Test suite "${suiteName}" not found`);
    }

    const startTime = Date.now();
    const testResults: TestResult[] = [];

    log.info(`Starting test suite: ${suiteName}`);

    // Get all tests for this suite
    const testNames = Array.from(this.tests.keys()).filter(name => 
      name.startsWith(`${suiteName}_`)
    );

    // Run all tests in the suite
    for (const testName of testNames) {
      const result = await this.runTest(testName);
      testResults.push(result);
    }

    // Calculate suite statistics
    const passedTests = testResults.filter(t => t.passed).length;
    const failedTests = testResults.filter(t => !t.passed).length;
    const duration = Date.now() - startTime;

    const updatedSuite: TestSuite = {
      ...suite,
      tests: testResults,
      passed_tests: passedTests,
      failed_tests: failedTests,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    };

    this.suites.set(suiteName, updatedSuite);

    log.info(`Test suite completed: ${suiteName}`, {
      suite_name: suiteName,
      total_tests: testResults.length,
      passed_tests: passedTests,
      failed_tests: failedTests,
      duration_ms: duration,
      success_rate: testResults.length > 0 ? (passedTests / testResults.length) * 100 : 0,
    });

    return updatedSuite;
  }

  // Run all tests
  async runAllTests(): Promise<TestSuite[]> {
    const results: TestSuite[] = [];
    
    for (const suiteName of this.suites.keys()) {
      const result = await this.runSuite(suiteName);
      results.push(result);
    }

    return results;
  }

  // Generate test report
  generateReport(suites: TestSuite[]): string {
    const totalTests = suites.reduce((sum, suite) => sum + suite.total_tests, 0);
    const totalPassed = suites.reduce((sum, suite) => sum + suite.passed_tests, 0);
    const totalFailed = suites.reduce((sum, suite) => sum + suite.failed_tests, 0);
    const totalDuration = suites.reduce((sum, suite) => sum + suite.duration_ms, 0);
    const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

    let report = `
# Test Report
Generated: ${new Date().toISOString()}

## Summary
- Total Tests: ${totalTests}
- Passed: ${totalPassed}
- Failed: ${totalFailed}
- Success Rate: ${successRate.toFixed(1)}%
- Total Duration: ${totalDuration}ms

## Suites
`;

    for (const suite of suites) {
      const suiteSuccessRate = suite.total_tests > 0 ? (suite.passed_tests / suite.total_tests) * 100 : 0;
      
      report += `
### ${suite.name}
- Tests: ${suite.total_tests}
- Passed: ${suite.passed_tests}
- Failed: ${suite.failed_tests}
- Success Rate: ${suiteSuccessRate.toFixed(1)}%
- Duration: ${suite.duration_ms}ms

`;

      // List failed tests
      const failedTests = suite.tests.filter(t => !t.passed);
      if (failedTests.length > 0) {
        report += `**Failed Tests:**\n`;
        for (const test of failedTests) {
          report += `- ${test.test_name}: ${test.error}\n`;
        }
        report += `\n`;
      }
    }

    return report;
  }
}

// Test utilities
export class TestUtils {
  // Assertion functions
  static assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  static assertEquals(actual: unknown, expected: unknown, message?: string): void {
    if (actual !== expected) {
      throw new Error(`Assertion failed: ${message || `Expected ${expected}, got ${actual}`}`);
    }
  }

  static assertDeepEquals(actual: unknown, expected: unknown, message?: string): void {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Assertion failed: ${message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
    }
  }

  static assertThrows(fn: () => void, expectedError?: string): void {
    try {
      fn();
      throw new Error('Expected function to throw, but it did not');
    } catch (error) {
      if (expectedError && !(error instanceof Error && error.message.includes(expectedError))) {
        throw new Error(`Expected error containing "${expectedError}", got "${error instanceof Error ? error.message : String(error)}"`);
      }
    }
  }

  static assertAsyncThrows(fn: () => Promise<unknown>, expectedError?: string): Promise<void> {
    return fn().then(
      () => {
        throw new Error('Expected function to throw, but it did not');
      },
      (error) => {
        if (expectedError && !(error instanceof Error && error.message.includes(expectedError))) {
          throw new Error(`Expected error containing "${expectedError}", got "${error instanceof Error ? error.message : String(error)}"`);
        }
      }
    );
  }

  // Mock utilities
  static createMock<T extends object>(defaultImplementation: Partial<T> = {}): T {
    return new Proxy({} as T, {
      get(target, prop) {
        if (prop in target) {
          return target[prop as keyof T];
        }
        if (prop in defaultImplementation) {
          return defaultImplementation[prop as keyof T];
        }
        // Return a mock function for any missing property
        return () => {};
      },
    });
  }

  // Test data generators
  static generateMockTicket(overrides: Partial<any> = {}): any {
    return {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: `user_${Date.now()}`,
      subject: 'Test ticket subject',
      content: 'This is a test ticket content for testing purposes.',
      category: 'Account',
      priority: 'medium',
      sentiment: 'neutral',
      sentiment_score: 0,
      status: 'open',
      customer_email: 'test@example.com',
      deflection_potential: 'medium',
      keywords: ['test', 'ticket'],
      tags: ['test'],
      metadata: {
        source: 'test',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  static generateMockUser(overrides: Partial<any> = {}): any {
    return {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: 'test@example.com',
      full_name: 'Test User',
      company: 'Test Company',
      subscription_status: 'trial',
      subscription_plan: 'starter',
      intercom_connected: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  // Performance testing
  static async measurePerformance<T>(
    fn: () => Promise<T>,
    iterations: number = 1
  ): Promise<{ result: T; duration_ms: number; avg_duration_ms: number }> {
    const startTime = Date.now();
    let result: T;

    if (iterations === 1) {
      result = await fn();
    } else {
      // Run multiple iterations for average
      const results: T[] = [];
      for (let i = 0; i < iterations; i++) {
        results.push(await fn());
      }
      result = results[0]; // Return first result
    }

    const duration = Date.now() - startTime;
    const avgDuration = duration / iterations;

    return {
      result,
      duration_ms: duration,
      avg_duration_ms: avgDuration,
    };
  }

  // Load testing
  static async loadTest<T>(
    fn: () => Promise<T>,
    concurrency: number,
    totalRequests: number
  ): Promise<{
    results: T[];
    total_duration_ms: number;
    avg_duration_ms: number;
    requests_per_second: number;
    success_count: number;
    error_count: number;
  }> {
    const startTime = Date.now();
    const results: T[] = [];
    const errors: Error[] = [];

    // Create batches of concurrent requests
    const batches = Math.ceil(totalRequests / concurrency);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(concurrency, totalRequests - batch * concurrency);
      const batchPromises = Array.from({ length: batchSize }, () => 
        fn().catch(error => {
          errors.push(error);
          throw error;
        })
      );

      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        // Continue with next batch even if this one fails
      }
    }

    const totalDuration = Date.now() - startTime;
    const successCount = results.length;
    const errorCount = errors.length;

    return {
      results,
      total_duration_ms: totalDuration,
      avg_duration_ms: totalDuration / totalRequests,
      requests_per_second: (totalRequests / totalDuration) * 1000,
      success_count: successCount,
      error_count: errorCount,
    };
  }
}

// Export singleton instance
export const testFramework = new TestFramework();
export const testUtils = TestUtils; 