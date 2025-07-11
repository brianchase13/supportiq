# 🚀 SupportIQ Setup Instructions

## Prerequisites
- Node.js 18+ installed
- Supabase account
- Intercom account (for testing)
- OpenAI API key

## Step 1: Database Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready
3. Go to SQL Editor and run the schema from `lib/supabase/schema.sql`

### Get Supabase Credentials
1. Go to Settings > API
2. Copy your Project URL and anon public key
3. Copy your service role key (needed for server-side operations)

## Step 2: Intercom App Setup

### Create Intercom App
1. Go to [Intercom Developer Hub](https://developers.intercom.com/)
2. Click "New App" and select "Build App"
3. Fill in app details:
   - **Name:** SupportIQ Integration
   - **Description:** AI-powered support analytics
   - **Redirect URL:** `http://localhost:3000/api/auth/intercom/callback`

### Configure Permissions
In your Intercom app settings:
1. Go to "Configure" > "Authentication"
2. Add these scopes:
   - `read_conversations`
   - `read_users`
3. Copy your Client ID and Client Secret

### OAuth Setup
1. Set redirect URI: `http://localhost:3000/api/auth/intercom/callback`
2. Enable OAuth for your app

## Step 3: OpenAI API Key

1. Go to [OpenAI API](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

## Step 4: Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Intercom Configuration
INTERCOM_CLIENT_ID=your_intercom_app_id
INTERCOM_CLIENT_SECRET=your_intercom_app_secret
INTERCOM_REDIRECT_URI=http://localhost:3000/api/auth/intercom/callback

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key_here

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here
```

## Step 5: Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your SupportIQ dashboard!

## Step 6: Test Intercom Integration

1. Go to `http://localhost:3000/settings`
2. Click "Connect" next to Intercom
3. Authorize the app with your Intercom account
4. Click "Sync Data" to pull in your conversations
5. Watch AI analysis happen in real-time!

## Troubleshooting

### Common Issues

**1. Supabase Connection Failed**
- Check your URL and keys in `.env.local`
- Ensure RLS policies are set up correctly
- Verify the schema was applied successfully

**2. Intercom OAuth Fails**
- Check redirect URI matches exactly
- Ensure app is published in Intercom
- Verify client ID and secret

**3. OpenAI Analysis Fails**
- Verify API key is correct
- Check you have credits in your OpenAI account
- Monitor rate limits

**4. No Data in Dashboard**
- Ensure you've synced data from settings
- Check browser console for errors
- Verify tickets exist in your Intercom account

### Debug Mode

Add this to your `.env.local` for detailed logging:
```bash
NODE_ENV=development
```

### Database Inspection

Check your Supabase dashboard:
1. Go to Table Editor
2. View `users`, `tickets`, `insights` tables
3. Check for data after sync

## Next Steps

1. **Add Real Users:** Implement proper authentication
2. **Add Billing:** Integrate Stripe for subscriptions  
3. **Add Notifications:** Set up email/Slack alerts
4. **Scale:** Optimize for larger datasets

## Support

- Check `GAMEPLAN.md` for development roadmap
- Review API endpoints in `/api` folder
- All mock data is in `lib/data/mockData.ts`

**Happy building! 🚀**