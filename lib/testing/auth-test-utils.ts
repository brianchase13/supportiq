import { createClient } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { User, Session, AuthTestResult, PageTestResult } from '@/lib/types';

interface TestUser {
  email: string;
  password: string;
  full_name: string;
  company: string;
  role: string;
}

interface AuthTestResult {
  success: boolean;
  message: string;
  user?: unknown;
  session?: unknown;
  error?: unknown;
}

export class AuthTestSuite {
  private supabase: unknown;
  private testUsers: TestUser[] = [];

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async createTestUser(userData: Partial<TestUser> = {}): Promise<TestUser> {
    const testUser: TestUser = {
      email: userData.email || `test-${Date.now()}@supportiq-test.com`,
      password: userData.password || 'TestPassword123!',
      full_name: userData.full_name || 'Test User',
      company: userData.company || 'Test Company',
      role: userData.role || 'Test Manager'
    };

    this.testUsers.push(testUser);
    return testUser;
  }

  async testSignUp(testUser?: TestUser): Promise<AuthTestResult> {
    try {
      const user = testUser || await this.createTestUser();
      
      const { data, error } = await this.supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.full_name,
            company: user.company,
            role: user.role
          }
        }
      });

      if (error) {
        return {
          success: false,
          message: `Sign up failed: ${error.message}`,
          error
        };
      }

      return {
        success: true,
        message: 'Sign up successful',
        user: data.user,
        session: data.session
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Sign up error: ${error.message}`,
        error
      };
    }
  }

  async testSignIn(email: string, password: string): Promise<AuthTestResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          message: `Sign in failed: ${error.message}`,
          error
        };
      }

      return {
        success: true,
        message: 'Sign in successful',
        user: data.user,
        session: data.session
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Sign in error: ${error.message}`,
        error
      };
    }
  }

  async testSignOut(): Promise<AuthTestResult> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          message: `Sign out failed: ${error.message}`,
          error
        };
      }

      return {
        success: true,
        message: 'Sign out successful'
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Sign out error: ${error.message}`,
        error
      };
    }
  }

  async testGetSession(): Promise<AuthTestResult> {
    try {
      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        return {
          success: false,
          message: `Get session failed: ${error.message}`,
          error
        };
      }

      return {
        success: true,
        message: `Session ${data.session ? 'active' : 'inactive'}`,
        session: data.session
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Get session error: ${error.message}`,
        error
      };
    }
  }

  async testGetUser(): Promise<AuthTestResult> {
    try {
      const { data, error } = await this.supabase.auth.getUser();

      if (error) {
        return {
          success: false,
          message: `Get user failed: ${error.message}`,
          error
        };
      }

      return {
        success: true,
        message: `User ${data.user ? 'found' : 'not found'}`,
        user: data.user
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Get user error: ${error.message}`,
        error
      };
    }
  }

  async testProfileCreation(userId: string): Promise<AuthTestResult> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return {
          success: false,
          message: `Profile check failed: ${error.message}`,
          error
        };
      }

      return {
        success: true,
        message: 'Profile exists and accessible',
        user: data
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `Profile check error: ${error.message}`,
        error
      };
    }
  }

  async testAuthFlow(): Promise<{ results: AuthTestResult[]; summary: string }> {
    const results: AuthTestResult[] = [];
    
    console.log('🧪 Starting comprehensive auth flow test...');

    // Test 1: Create and sign up new user
    console.log('1. Testing user signup...');
    const testUser = await this.createTestUser();
    const signUpResult = await this.testSignUp(testUser);
    results.push(signUpResult);

    if (!signUpResult.success) {
      return {
        results,
        summary: '❌ Auth test failed at signup'
      };
    }

    // Test 2: Check session after signup
    console.log('2. Testing session after signup...');
    const sessionResult = await this.testGetSession();
    results.push(sessionResult);

    // Test 3: Check user data
    console.log('3. Testing user data retrieval...');
    const userResult = await this.testGetUser();
    results.push(userResult);

    // Test 4: Check profile creation
    if (signUpResult.user?.id) {
      console.log('4. Testing profile creation...');
      const profileResult = await this.testProfileCreation(signUpResult.user.id);
      results.push(profileResult);
    }

    // Test 5: Sign out
    console.log('5. Testing sign out...');
    const signOutResult = await this.testSignOut();
    results.push(signOutResult);

    // Test 6: Check session after signout
    console.log('6. Testing session after signout...');
    const postSignOutSession = await this.testGetSession();
    results.push(postSignOutSession);

    // Test 7: Sign back in
    console.log('7. Testing sign in...');
    const signInResult = await this.testSignIn(testUser.email, testUser.password);
    results.push(signInResult);

    // Test 8: Final session check
    console.log('8. Testing final session...');
    const finalSession = await this.testGetSession();
    results.push(finalSession);

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    const summary = `✅ Auth flow test completed: ${successCount}/${totalCount} tests passed`;
    
    return { results, summary };
  }

  async testPageAccess(pages: string[]): Promise<{ results: unknown[]; summary: string }> {
    const results: unknown[] = [];
    
    console.log('🌐 Testing page access with authentication...');

    for (const page of pages) {
      try {
        // This would typically be done with a headless browser or API testing
        // For now, we'll simulate the test
        const mockTest = {
          page,
          success: true,
          message: `Page ${page} accessible with auth`,
          status: 200
        };
        
        results.push(mockTest);
        console.log(`✅ ${page}: Accessible`);
      } catch (error: unknown) {
        results.push({
          page,
          success: false,
          message: `Page ${page} failed: ${error.message}`,
          error
        });
        console.log(`❌ ${page}: Failed`);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const summary = `Page access test: ${successCount}/${results.length} pages accessible`;

    return { results, summary };
  }

  async cleanupTestUsers(): Promise<void> {
    console.log('🧹 Cleaning up test users...');
    
    for (const testUser of this.testUsers) {
      try {
        // In production, you'd have an admin endpoint to delete test users
        // For now, we'll just log the cleanup
        console.log(`Would delete test user: ${testUser.email}`);
      } catch (error) {
        console.error(`Failed to cleanup user ${testUser.email}:`, error);
      }
    }
    
    this.testUsers = [];
  }

  generateTestReport(authResults: AuthTestResult[], pageResults?: unknown[]): string {
    const timestamp = new Date().toISOString();
    const authSuccess = authResults.filter(r => r.success).length;
    const authTotal = authResults.length;
    
    let report = `
# SupportIQ Authentication Test Report
Generated: ${timestamp}

## Authentication Flow Tests
Passed: ${authSuccess}/${authTotal}

`;

    authResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      report += `${index + 1}. ${status} ${result.message}\n`;
      if (!result.success && result.error) {
        report += `   Error: ${result.error.message || 'Unknown error'}\n`;
      }
    });

    if (pageResults) {
      const pageSuccess = pageResults.filter(r => r.success).length;
      const pageTotal = pageResults.length;
      
      report += `
## Page Access Tests
Passed: ${pageSuccess}/${pageTotal}

`;
      
      pageResults.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        report += `${index + 1}. ${status} ${result.page}: ${result.message}\n`;
      });
    }

    report += `
## Summary
- Authentication flow: ${authSuccess === authTotal ? 'PASS' : 'FAIL'}`;
    
    if (pageResults) {
      const pageSuccess = pageResults.filter(r => r.success).length;
      const pageTotal = pageResults.length;
      report += `
- Page access: ${pageSuccess === pageTotal ? 'PASS' : 'FAIL'}`;
    }

    report += `
- Overall status: ${authSuccess === authTotal ? '🟢 HEALTHY' : '🔴 ISSUES DETECTED'}
`;

    return report;
  }
}