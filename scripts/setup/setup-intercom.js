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

(async () => {
  console.log('\n🚀 Intercom Integration Automated Setup');
  console.log('======================================');
  console.log('\n1. Go to: https://app.intercom.com/a/developer-signup');
  console.log('2. Create a new app (e.g., "SupportIQ Integration")');
  console.log('3. In the app settings, copy:');
  console.log('   - Client ID');
  console.log('   - Client Secret');
  console.log('4. Set the OAuth Redirect URI to: https://supportiq.vercel.app/api/auth/intercom/callback');
  console.log('5. In Webhooks, add: https://supportiq.vercel.app/api/webhooks/intercom');
  console.log('6. Copy the Webhook Secret');
  console.log('\nPaste the values below:');

  const clientId = await prompt('Intercom Client ID: ');
  const clientSecret = await prompt('Intercom Client Secret: ');
  const webhookSecret = await prompt('Intercom Webhook Secret: ');

  updateEnv('INTERCOM_CLIENT_ID', clientId);
  updateEnv('INTERCOM_CLIENT_SECRET', clientSecret);
  updateEnv('INTERCOM_WEBHOOK_SECRET', webhookSecret);

  console.log('\n✅ .env.local updated with Intercom credentials!');
  console.log('\n🔍 Next steps:');
  console.log('1. Run: node check-setup.js');
  console.log('2. Deploy to Vercel');
  console.log('3. Test Intercom OAuth and webhook connection');
})(); 