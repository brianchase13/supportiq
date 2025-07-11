-- Analytics and monitoring schema for SupportIQ

-- Store all analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User analytics traits and identification
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  traits JSONB NOT NULL DEFAULT '{}',
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User metrics for business intelligence
CREATE TABLE IF NOT EXISTS user_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Activation metrics
  intercom_connected_at TIMESTAMPTZ,
  first_sync_at TIMESTAMPTZ,
  first_insight_at TIMESTAMPTZ,
  first_dashboard_access_at TIMESTAMPTZ,
  
  -- Conversion metrics
  trial_started_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  churned_at TIMESTAMPTZ,
  
  -- Engagement metrics
  last_active_at TIMESTAMPTZ,
  total_sessions INTEGER DEFAULT 0,
  total_insights_viewed INTEGER DEFAULT 0,
  total_actions_taken INTEGER DEFAULT 0,
  
  -- Business metrics
  lifetime_value DECIMAL(10,2) DEFAULT 0,
  monthly_recurring_revenue DECIMAL(10,2) DEFAULT 0,
  churn_prediction_score INTEGER DEFAULT 0,
  activation_score INTEGER DEFAULT 0,
  
  -- Calculated metrics
  time_to_first_insight INTEGER, -- seconds
  time_to_first_connection INTEGER, -- seconds
  insight_action_conversion_rate DECIMAL(5,2), -- percentage
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feature usage tracking
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A/B test tracking
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_at TIMESTAMPTZ,
  conversion_value DECIMAL(10,2),
  
  UNIQUE(user_id, test_name)
);

-- Cohort analysis
CREATE TABLE IF NOT EXISTS user_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cohort_month TEXT NOT NULL, -- YYYY-MM format
  cohort_size INTEGER NOT NULL,
  week_0_retained BOOLEAN DEFAULT false,
  week_1_retained BOOLEAN DEFAULT false,
  week_2_retained BOOLEAN DEFAULT false,
  week_4_retained BOOLEAN DEFAULT false,
  week_8_retained BOOLEAN DEFAULT false,
  week_12_retained BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, cohort_month)
);

-- Critical success metrics tracking
CREATE TABLE IF NOT EXISTS success_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  target_value DECIMAL(10,4),
  achieved BOOLEAN DEFAULT false,
  
  -- Specific metrics
  activation_rate DECIMAL(5,2), -- % of users who connect Intercom within 10 min
  time_to_value_avg INTEGER, -- Average seconds to first insight
  daily_active_rate DECIMAL(5,2), -- % of users active daily
  upgrade_conversion_rate DECIMAL(5,2), -- % who upgrade within first month
  gary_tan_test_rate DECIMAL(5,2), -- % who show purchase intent in 5 min
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(date, metric_name)
);

-- Payment and revenue tracking
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT,
  amount INTEGER NOT NULL, -- cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- Usage enforcement logs
CREATE TABLE IF NOT EXISTS usage_enforcement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'warning', 'limit_reached', 'restored'
  usage_at_enforcement INTEGER NOT NULL,
  limit_at_enforcement INTEGER NOT NULL,
  enforced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Email logs for campaign tracking
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'welcome', 'activation', 'usage_warning', 'upgrade_prompt'
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  campaign_id TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'sent' -- 'sent', 'delivered', 'bounced', 'failed'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature ON feature_usage(user_id, feature_name);
CREATE INDEX IF NOT EXISTS idx_success_metrics_date ON success_metrics(date);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- RLS policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_enforcement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own analytics data
CREATE POLICY "Users can access their own analytics" ON analytics_events
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own metrics" ON user_metrics
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own feature usage" ON feature_usage
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own A/B tests" ON ab_tests
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own cohort data" ON user_cohorts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own payments" ON payments
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own usage logs" ON usage_enforcement_logs
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own email logs" ON email_logs
  FOR ALL USING (user_id = auth.uid());

-- Success metrics are readable by admins only
CREATE POLICY "Success metrics are admin only" ON success_metrics
  FOR SELECT USING (false); -- Will be managed by admin functions

-- Functions for metrics calculation
CREATE OR REPLACE FUNCTION calculate_daily_metrics()
RETURNS VOID AS $$
DECLARE
  today DATE := CURRENT_DATE;
  activation_rate DECIMAL(5,2);
  time_to_value_avg INTEGER;
  daily_active_rate DECIMAL(5,2);
  upgrade_rate DECIMAL(5,2);
  gary_tan_rate DECIMAL(5,2);
BEGIN
  -- Calculate activation rate (Intercom connected within 10 min)
  WITH activation_data AS (
    SELECT 
      user_id,
      EXTRACT(EPOCH FROM (intercom_connected_at - created_at)) AS time_to_connect
    FROM user_metrics
    WHERE created_at >= today - INTERVAL '1 day'
    AND created_at < today
    AND intercom_connected_at IS NOT NULL
  )
  SELECT 
    ROUND(
      (COUNT(CASE WHEN time_to_connect <= 600 THEN 1 END) * 100.0 / COUNT(*)),
      2
    ) INTO activation_rate
  FROM activation_data;

  -- Calculate average time to first insight
  SELECT 
    ROUND(AVG(time_to_first_insight))::INTEGER INTO time_to_value_avg
  FROM user_metrics
  WHERE first_insight_at >= today - INTERVAL '1 day'
  AND first_insight_at < today
  AND time_to_first_insight IS NOT NULL;

  -- Calculate daily active rate
  WITH daily_users AS (
    SELECT COUNT(DISTINCT user_id) as active_users
    FROM analytics_events
    WHERE DATE(timestamp) = today - INTERVAL '1 day'
    AND event_name = 'daily_active_session'
  ),
  total_users AS (
    SELECT COUNT(*) as total
    FROM users
    WHERE subscription_status = 'active'
  )
  SELECT 
    ROUND((active_users * 100.0 / total), 2) INTO daily_active_rate
  FROM daily_users, total_users;

  -- Calculate upgrade conversion rate (within first month)
  WITH upgrade_data AS (
    SELECT 
      user_id,
      EXTRACT(EPOCH FROM (converted_at - created_at)) / 86400 AS days_to_convert
    FROM user_metrics
    WHERE created_at >= today - INTERVAL '30 days'
    AND converted_at IS NOT NULL
  )
  SELECT 
    ROUND(
      (COUNT(CASE WHEN days_to_convert <= 30 THEN 1 END) * 100.0 / COUNT(*)),
      2
    ) INTO upgrade_rate
  FROM upgrade_data;

  -- Calculate Gary Tan test rate (purchase intent in 5 min)
  WITH gary_tan_data AS (
    SELECT COUNT(*) as passed
    FROM analytics_events
    WHERE event_name = 'gary_tan_test'
    AND DATE(timestamp) = today - INTERVAL '1 day'
    AND (properties->>'achieved')::boolean = true
  ),
  total_tests AS (
    SELECT COUNT(*) as total
    FROM analytics_events
    WHERE event_name = 'gary_tan_test'
    AND DATE(timestamp) = today - INTERVAL '1 day'
  )
  SELECT 
    ROUND((passed * 100.0 / NULLIF(total, 0)), 2) INTO gary_tan_rate
  FROM gary_tan_data, total_tests;

  -- Insert daily metrics
  INSERT INTO success_metrics (
    date,
    metric_name,
    metric_value,
    target_value,
    achieved,
    activation_rate,
    time_to_value_avg,
    daily_active_rate,
    upgrade_conversion_rate,
    gary_tan_test_rate
  ) VALUES (
    today - INTERVAL '1 day',
    'daily_summary',
    COALESCE(activation_rate, 0),
    80.0, -- Target 80% activation rate
    COALESCE(activation_rate, 0) >= 80.0,
    COALESCE(activation_rate, 0),
    COALESCE(time_to_value_avg, 0),
    COALESCE(daily_active_rate, 0),
    COALESCE(upgrade_rate, 0),
    COALESCE(gary_tan_rate, 0)
  ) ON CONFLICT (date, metric_name) DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    achieved = EXCLUDED.achieved,
    activation_rate = EXCLUDED.activation_rate,
    time_to_value_avg = EXCLUDED.time_to_value_avg,
    daily_active_rate = EXCLUDED.daily_active_rate,
    upgrade_conversion_rate = EXCLUDED.upgrade_conversion_rate,
    gary_tan_test_rate = EXCLUDED.gary_tan_test_rate;

END;
$$ LANGUAGE plpgsql;

-- Automatic timestamp updates
CREATE TRIGGER update_user_analytics_updated_at
  BEFORE UPDATE ON user_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_metrics_updated_at
  BEFORE UPDATE ON user_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();