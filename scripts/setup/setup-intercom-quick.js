const fs = require('fs');
const readline = require('readline');
const path = require('path');

const envPath = path.resolve('.env.local');

function updateEnv(key, value) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  const regex = new RegExp(`${key}=.*`);
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}`;
  }
  fs.writeFileSync(envPath, envContent);
}

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

async function setupIntercom() {
  console.log('\n🚀 Quick Intercom Setup for SupportIQ');
  console.log('=======================================');
  console.log('\n✅ Assuming you have your development workspace ready!');
  
  console.log('\n🎯 STEP 1: Create Your App');
  console.log('==========================');
  console.log('1. Go to: https://app.intercom.com/a/developer-signup');
  console.log('2. Click "New App" in Developer Hub');
  console.log('3. Choose "Build an app"');
  console.log('4. App Name: "SupportIQ Integration"');
  console.log('5. Description: "AI-powered support analytics and ticket deflection"');
  console.log('6. Workspace: Select your development workspace');
  
  const hasApp = await prompt('\n✅ Have you created the SupportIQ app? (y/n): ');
  
  if (hasApp.toLowerCase() !== 'y') {
    console.log('\n⏳ Please create the app first, then run this script again.');
    return;
  }

  console.log('\n🎯 STEP 2: OAuth Configuration');
  console.log('==============================');
  console.log('1. In your app settings, go to "Authentication"');
  console.log('2. Add Redirect URL: https://supportiq.vercel.app/api/auth/intercom/callback');
  console.log('3. Required permissions:');
  console.log('   ✅ Read conversations');
  console.log('   ✅ Read users');
  console.log('   ✅ Read admins');
  console.log('   ✅ Read tickets');
  console.log('4. Save settings');
  
  const oauthConfigured = await prompt('\n✅ Is OAuth configured? (y/n): ');
  
  if (oauthConfigured.toLowerCase() !== 'y') {
    console.log('\n⏳ Please configure OAuth first, then run this script again.');
    return;
  }

  console.log('\n🎯 STEP 3: Webhook Configuration');
  console.log('================================');
  console.log('1. In your app settings, go to "Webhooks"');
  console.log('2. Add webhook URL: https://supportiq.vercel.app/api/webhooks/intercom');
  console.log('3. Select these topics:');
  console.log('   ✅ conversation.user.created');
  console.log('   ✅ conversation.user.replied');
  console.log('   ✅ conversation.admin.replied');
  console.log('   ✅ conversation.admin.closed');
  console.log('   ✅ ticket.created');
  console.log('   ✅ ticket.updated');
  console.log('4. Save webhook configuration');
  
  const webhookConfigured = await prompt('\n✅ Is webhook configured? (y/n): ');
  
  if (webhookConfigured.toLowerCase() !== 'y') {
    console.log('\n⏳ Please configure webhooks first, then run this script again.');
    return;
  }

  console.log('\n🎯 STEP 4: Get Your Credentials');
  console.log('===============================');
  console.log('1. In your app settings, go to "Basic Information"');
  console.log('2. Copy the following values:');
  
  const clientId = await prompt('\n📋 Intercom Client ID: ');
  const clientSecret = await prompt('📋 Intercom Client Secret: ');
  const webhookSecret = await prompt('📋 Intercom Webhook Secret: ');

  // Validate inputs
  if (!clientId || !clientSecret || !webhookSecret) {
    console.log('\n❌ All credentials are required. Please try again.');
    return;
  }

  // Update environment variables
  updateEnv('INTERCOM_CLIENT_ID', clientId);
  updateEnv('INTERCOM_CLIENT_SECRET', clientSecret);
  updateEnv('INTERCOM_WEBHOOK_SECRET', webhookSecret);
  updateEnv('INTERCOM_REDIRECT_URI', 'https://supportiq.vercel.app/api/auth/intercom/callback');

  console.log('\n✅ Environment variables updated successfully!');
  
  console.log('\n🎯 STEP 5: Database Setup');
  console.log('==========================');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Open the SQL editor');
  console.log('3. Copy and paste the contents of: lib/supabase/intercom-schema.sql');
  console.log('4. Run the SQL to create all tables and functions');
  
  const dbSetup = await prompt('\n✅ Have you set up the database schema? (y/n): ');
  
  if (dbSetup.toLowerCase() !== 'y') {
    console.log('\n⏳ Please set up the database schema first.');
    console.log('📄 File location: lib/supabase/intercom-schema.sql');
    return;
  }

  console.log('\n🎯 STEP 6: Test Your Setup');
  console.log('==========================');
  console.log('1. Deploy to Vercel: vercel --prod');
  console.log('2. Test OAuth flow in your app');
  console.log('3. Verify webhook delivery in Intercom dashboard');
  console.log('4. Check analytics in SupportIQ dashboard');
  
  console.log('\n🎉 Intercom Setup Complete!');
  console.log('==========================');
  console.log('Your SupportIQ app is now ready for Intercom integration.');
  console.log('All credentials are securely stored in .env.local');
  
  // Create a summary file
  const summary = {
    setupDate: new Date().toISOString(),
    intercomApp: 'SupportIQ Integration',
    oauthRedirectUrl: 'https://supportiq.vercel.app/api/auth/intercom/callback',
    webhookUrl: 'https://supportiq.vercel.app/api/webhooks/intercom',
    permissions: ['Read conversations', 'Read users', 'Read admins', 'Read tickets'],
    webhookTopics: [
      'conversation.user.created',
      'conversation.user.replied', 
      'conversation.admin.replied',
      'conversation.admin.closed',
      'ticket.created',
      'ticket.updated'
    ],
    documentation: 'https://developers.intercom.com/docs',
    nextSteps: [
      'Deploy to Vercel',
      'Test OAuth connection',
      'Verify webhook delivery',
      'Check analytics dashboard'
    ]
  };
  
  fs.writeFileSync('intercom-setup-summary.json', JSON.stringify(summary, null, 2));
  console.log('\n📄 Setup summary saved to: intercom-setup-summary.json');
  
  console.log('\n🔗 Quick Links:');
  console.log('• Intercom Developer Hub: https://app.intercom.com/a/developer-signup');
  console.log('• Intercom Documentation: https://developers.intercom.com/docs');
  console.log('• SupportIQ Dashboard: https://supportiq.vercel.app/dashboard');
}

setupIntercom().catch(console.error); 