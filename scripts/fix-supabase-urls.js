#!/usr/bin/env node

/**
 * Script to update Supabase project settings
 * This script helps fix the redirect URL issues
 */

const fs = require('fs');
const path = require('path');

// Read environment variables
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Extract Supabase URL
const supabaseUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const supabaseUrl = supabaseUrlMatch ? supabaseUrlMatch[1] : null;

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  process.exit(1);
}

const projectId = supabaseUrl.split('//')[1].split('.')[0];
const productionUrl = 'https://supportiq-is54se1bo-brianfprojects.vercel.app';

console.log('🔧 Supabase Project Configuration Fix');
console.log('=====================================');
console.log(`Project ID: ${projectId}`);
console.log(`Production URL: ${productionUrl}`);
console.log('');

console.log('📋 Manual Steps Required:');
console.log('');
console.log('1. Go to: https://supabase.com/dashboard/project/' + projectId);
console.log('2. Navigate to: Settings → Authentication → URL Configuration');
console.log('3. Update Site URL to: ' + productionUrl);
console.log('4. Add these Redirect URLs:');
console.log('   - ' + productionUrl + '/auth/callback');
console.log('   - ' + productionUrl + '/auth/reset-password');
console.log('   - ' + productionUrl + '/auth');
console.log('5. Save changes');
console.log('');

console.log('🚀 After updating Supabase settings:');
console.log('- Email confirmation links will work correctly');
console.log('- Password reset links will redirect to production');
console.log('- All auth flows will use the correct domain');
console.log('');

console.log('💡 Alternative: Use the middleware redirect as a temporary fix');
console.log('The middleware will automatically redirect localhost auth callbacks to production.'); 