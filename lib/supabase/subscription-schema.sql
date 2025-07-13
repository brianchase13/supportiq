-- Subscription and billing schema for SupportIQ

-- User settings table to store plan limits and preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ai_responses_limit INTEGER DEFAULT 100 NOT NULL,
  team_members_limit INTEGER DEFAULT 2 NOT NULL,
  integrations_limit INTEGER DEFAULT 1 NOT NULL,
  tickets_per_month_limit INTEGER DEFAULT 1000 NOT NULL,
  storage_gb_limit INTEGER DEFAULT 1 NOT NULL,
  notification_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Subscriptions table to track Stripe subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid', 'unknown')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checkout sessions table to track Stripe checkout sessions
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  stripe_session_id TEXT,
  plan_id TEXT NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount INTEGER NOT NULL, -- Amount in cents
  projected_savings INTEGER DEFAULT 0,
  ticket_volume INTEGER DEFAULT 0,
  roi_multiplier DECIMAL(5,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'canceled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription events table for analytics and tracking
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activations table to track onboarding and activation
CREATE TABLE IF NOT EXISTS user_activations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  ticket_volume INTEGER DEFAULT 0,
  projected_savings INTEGER DEFAULT 0,
  activation_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activation_completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  activation_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deflection analyses table for storing analysis results
CREATE TABLE IF NOT EXISTS deflection_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_date DATE NOT NULL,
  total_tickets INTEGER NOT NULL,
  deflectable_tickets INTEGER NOT NULL,
  deflection_rate DECIMAL(5,2) NOT NULL,
  potential_savings INTEGER NOT NULL, -- in cents
  analysis_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_session_id ON checkout_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_status ON checkout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON subscription_events(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created ON subscription_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activations_user_id ON user_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activations_status ON user_activations(status);
CREATE INDEX IF NOT EXISTS idx_deflection_analyses_user_id ON deflection_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_deflection_analyses_date ON deflection_analyses(analysis_date);

-- Row Level Security (RLS) Policies

-- User settings policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can manage all user settings" ON user_settings
  FOR ALL USING (auth.role() = 'service_role');

-- Subscriptions policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage all subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Checkout sessions policies
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own checkout sessions" ON checkout_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage all checkout sessions" ON checkout_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Subscription events policies
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription events" ON subscription_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage all subscription events" ON subscription_events
  FOR ALL USING (auth.role() = 'service_role');

-- User activations policies
ALTER TABLE user_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activations" ON user_activations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage all activations" ON user_activations
  FOR ALL USING (auth.role() = 'service_role');

-- Deflection analyses policies
ALTER TABLE deflection_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses" ON deflection_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage all analyses" ON deflection_analyses
  FOR ALL USING (auth.role() = 'service_role');

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkout_sessions_updated_at 
  BEFORE UPDATE ON checkout_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_activations_updated_at 
  BEFORE UPDATE ON user_activations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_uuid UUID)
RETURNS TABLE (
  subscription_status TEXT,
  subscription_plan TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.status,
    u.subscription_plan,
    s.current_period_end,
    s.cancel_at_period_end
  FROM subscriptions s
  JOIN auth.users u ON u.id = s.user_id
  WHERE s.user_id = user_uuid
  AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user usage statistics
CREATE OR REPLACE FUNCTION get_user_usage_stats(user_uuid UUID)
RETURNS TABLE (
  ai_responses_used BIGINT,
  ai_responses_limit INTEGER,
  team_members_added BIGINT,
  team_members_limit INTEGER,
  integrations_connected BIGINT,
  integrations_limit INTEGER,
  tickets_processed BIGINT,
  tickets_limit INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(ar.id), 0) as ai_responses_used,
    COALESCE(us.ai_responses_limit, 100) as ai_responses_limit,
    COALESCE(COUNT(DISTINCT tm.id), 0) as team_members_added,
    COALESCE(us.team_members_limit, 2) as team_members_limit,
    COALESCE(COUNT(DISTINCT i.id), 0) as integrations_connected,
    COALESCE(us.integrations_limit, 1) as integrations_limit,
    COALESCE(COUNT(t.id), 0) as tickets_processed,
    COALESCE(us.tickets_per_month_limit, 1000) as tickets_limit
  FROM auth.users u
  LEFT JOIN user_settings us ON us.user_id = u.id
  LEFT JOIN ai_responses ar ON ar.user_id = u.id
  LEFT JOIN team_members tm ON tm.user_id = u.id
  LEFT JOIN integrations i ON i.user_id = u.id
  LEFT JOIN tickets t ON t.user_id = u.id
  WHERE u.id = user_uuid
  GROUP BY us.ai_responses_limit, us.team_members_limit, us.integrations_limit, us.tickets_per_month_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default user settings for new users
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id, ai_responses_limit, team_members_limit, integrations_limit, tickets_per_month_limit, storage_gb_limit)
  VALUES (NEW.id, 100, 2, 1, 1000, 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_settings_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_user_settings(); 