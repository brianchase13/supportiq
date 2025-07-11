-- Enhanced production schema for SupportIQ
-- Run this after the basic schema

-- Add new columns to users table for production features
ALTER TABLE users ADD COLUMN IF NOT EXISTS intercom_refresh_token text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS intercom_workspace_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS intercom_connected_at timestamp with time zone;
ALTER TABLE users ADD COLUMN IF NOT EXISTS intercom_token_expires_at timestamp with time zone;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_limit integer DEFAULT 1000;
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_current integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_reset_at timestamp with time zone DEFAULT date_trunc('month', now() + interval '1 month');

-- OAuth state management table
CREATE TABLE IF NOT EXISTS oauth_states (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  state text UNIQUE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Audit logs for security and debugging
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text, -- Can be UUID or 'unknown' for failed attempts
  action text NOT NULL,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enhanced tickets table with embeddings and caching
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS embedding vector(1536); -- OpenAI embeddings
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS analysis_version integer DEFAULT 1;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS cached_until timestamp with time zone;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS similar_tickets text[]; -- Array of similar ticket IDs

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  operation_type text NOT NULL, -- 'sync', 'analyze', 'insight_generation'
  tokens_used integer DEFAULT 0,
  cost_usd decimal(10,4) DEFAULT 0,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Webhook events table for real-time sync
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'conversation.created', 'conversation.updated', etc.
  intercom_event_id text UNIQUE,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price_monthly integer NOT NULL, -- Price in cents
  ticket_limit integer NOT NULL,
  features jsonb NOT NULL DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, price_monthly, ticket_limit, features) VALUES 
('free', 'Free Trial', 0, 100, '{"ai_insights": false, "webhook_sync": false, "advanced_analytics": false}'),
('starter', 'Starter', 9900, 1000, '{"ai_insights": true, "webhook_sync": false, "advanced_analytics": false}'),
('pro', 'Pro', 29900, 10000, '{"ai_insights": true, "webhook_sync": true, "advanced_analytics": true}'),
('enterprise', 'Enterprise', 89900, 999999, '{"ai_insights": true, "webhook_sync": true, "advanced_analytics": true, "custom_integrations": true}')
ON CONFLICT (id) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  features = EXCLUDED.features;

-- Data quality metrics table
CREATE TABLE IF NOT EXISTS data_quality_metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  metric_type text NOT NULL, -- 'ticket_categorization_accuracy', 'sentiment_confidence', etc.
  value decimal(5,4) NOT NULL, -- 0.0 to 1.0 for accuracy metrics
  sample_size integer NOT NULL,
  calculated_at timestamp with time zone DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_embedding ON tickets USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_tickets_cached_until ON tickets(cached_until);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_operation ON usage_logs(user_id, operation_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed, created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_type ON webhook_events(user_id, event_type);

-- Enable RLS on new tables
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can only see their own oauth states" ON oauth_states
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own audit logs" ON audit_logs
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can only see their own usage logs" ON usage_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own webhook events" ON webhook_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own metrics" ON data_quality_metrics
  FOR ALL USING (auth.uid() = user_id);

-- Subscription plans are public read-only
CREATE POLICY "Anyone can read subscription plans" ON subscription_plans
  FOR SELECT USING (true);

-- Cleanup function for expired oauth states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_states WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Function to update usage tracking
CREATE OR REPLACE FUNCTION update_user_usage(
  p_user_id uuid,
  p_operation_type text,
  p_tokens_used integer DEFAULT 0,
  p_cost_usd decimal DEFAULT 0
)
RETURNS void AS $$
BEGIN
  -- Insert usage log
  INSERT INTO usage_logs (user_id, operation_type, tokens_used, cost_usd)
  VALUES (p_user_id, p_operation_type, p_tokens_used, p_cost_usd);
  
  -- Update current usage
  UPDATE users 
  SET usage_current = usage_current + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET 
    usage_current = 0,
    usage_reset_at = date_trunc('month', now() + interval '1 month')
  WHERE usage_reset_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic cleanup
CREATE OR REPLACE FUNCTION trigger_cleanup_oauth_states()
RETURNS trigger AS $$
BEGIN
  PERFORM cleanup_expired_oauth_states();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs cleanup every hour
-- Note: This would typically be handled by a cron job in production
CREATE TRIGGER oauth_cleanup_trigger
  AFTER INSERT ON oauth_states
  EXECUTE FUNCTION trigger_cleanup_oauth_states();