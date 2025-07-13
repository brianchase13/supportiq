-- Enhanced production schema with Intercom integration support

-- Users table with Intercom integration fields
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'user',
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  intercom_access_token TEXT,
  intercom_workspace_id TEXT,
  intercom_webhook_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table with enhanced Intercom support
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  intercom_id TEXT,
  subject TEXT,
  content TEXT NOT NULL,
  category TEXT,
  subcategory TEXT,
  priority TEXT DEFAULT 'normal',
  sentiment TEXT,
  sentiment_score DECIMAL(3,2),
  deflection_potential DECIMAL(3,2),
  confidence DECIMAL(3,2),
  keywords TEXT[],
  intent TEXT,
  estimated_resolution_time INTEGER, -- in minutes
  requires_human BOOLEAN DEFAULT TRUE,
  tags TEXT[],
  embedding VECTOR(1536),
  similar_tickets JSONB,
  deflected BOOLEAN DEFAULT FALSE,
  deflection_response TEXT,
  deflection_confidence DECIMAL(3,2),
  response_sent BOOLEAN DEFAULT FALSE,
  response_sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Ticket responses table
CREATE TABLE IF NOT EXISTS ticket_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  intercom_response_id TEXT,
  response_type TEXT DEFAULT 'automated', -- automated, manual, test
  content TEXT NOT NULL,
  confidence DECIMAL(3,2),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Webhook logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL, -- intercom, zendesk, etc.
  event_type TEXT NOT NULL,
  event_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- pending, success, error
  error_message TEXT
);

-- Integration logs table
CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  action TEXT NOT NULL, -- connect, disconnect, sync, etc.
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync logs table
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  action TEXT NOT NULL, -- sync, full_sync, etc.
  status TEXT DEFAULT 'started', -- started, completed, error
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table for deflection metrics
CREATE TABLE IF NOT EXISTS deflection_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_tickets INTEGER DEFAULT 0,
  deflected_tickets INTEGER DEFAULT 0,
  deflection_rate DECIMAL(5,2),
  avg_response_time_minutes INTEGER,
  avg_resolution_time_minutes INTEGER,
  category_breakdown JSONB,
  sentiment_breakdown JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Benchmarks table
CREATE TABLE IF NOT EXISTS benchmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  benchmark_value DECIMAL(10,2),
  industry_average DECIMAL(10,2),
  percentile INTEGER,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, metric_name, date)
);

-- Pricing table
CREATE TABLE IF NOT EXISTS pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT DEFAULT 'monthly',
  features JSONB,
  limits JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  tickets_processed INTEGER DEFAULT 0,
  responses_sent INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_intercom_id ON tickets(intercom_id);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_deflected ON tickets(deflected);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_user_id ON webhook_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_at ON webhook_logs(processed_at);

CREATE INDEX IF NOT EXISTS idx_integration_logs_user_id ON integration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_provider ON integration_logs(provider);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_provider ON sync_logs(provider);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(status);

CREATE INDEX IF NOT EXISTS idx_deflection_analytics_user_id ON deflection_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_deflection_analytics_date ON deflection_analytics(date);

CREATE INDEX IF NOT EXISTS idx_benchmarks_user_id ON benchmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_benchmarks_metric_name ON benchmarks(metric_name);
CREATE INDEX IF NOT EXISTS idx_benchmarks_date ON benchmarks(date);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_date ON usage_tracking(date);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deflection_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets" ON tickets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own ticket responses" ON ticket_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ticket responses" ON ticket_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own webhook logs" ON webhook_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own integration logs" ON integration_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sync logs" ON sync_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON deflection_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own benchmarks" ON benchmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own pricing" ON pricing
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deflection_analytics_updated_at BEFORE UPDATE ON deflection_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE ON pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate deflection rate
CREATE OR REPLACE FUNCTION calculate_deflection_rate(user_uuid UUID, start_date DATE, end_date DATE)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  total_tickets INTEGER;
  deflected_tickets INTEGER;
  rate DECIMAL(5,2);
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE deflected = true)
  INTO total_tickets, deflected_tickets
  FROM tickets
  WHERE user_id = user_uuid
    AND created_at::date BETWEEN start_date AND end_date;
  
  IF total_tickets = 0 THEN
    RETURN 0;
  END IF;
  
  rate := (deflected_tickets::DECIMAL / total_tickets::DECIMAL) * 100;
  RETURN ROUND(rate, 2);
END;
$$ LANGUAGE plpgsql;

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  requests INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON rate_limits(user_id, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

-- RLS policies for rate limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limits
CREATE POLICY "Users can view own rate limits" ON rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own rate limits
CREATE POLICY "Users can update own rate limits" ON rate_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert rate limits (for API operations)
CREATE POLICY "System can insert rate limits" ON rate_limits
  FOR INSERT WITH CHECK (true);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  deflection_settings JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies for user settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own settings
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  error_id TEXT NOT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  component_stack TEXT,
  url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for error logs
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_id ON error_logs(error_id);

-- RLS policies for error logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own error logs
CREATE POLICY "Users can view own error logs" ON error_logs
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert error logs
CREATE POLICY "System can insert error logs" ON error_logs
  FOR INSERT WITH CHECK (true);