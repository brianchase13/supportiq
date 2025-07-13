-- Leads table for customer acquisition
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  source TEXT DEFAULT 'landing_page',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ticket_volume INTEGER,
  current_tool TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'qualified', 'contacted', 'converted', 'lost')),
  visit_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demo bookings table
CREATE TABLE IF NOT EXISTS demo_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  ticket_volume TEXT NOT NULL,
  current_tool TEXT,
  use_case TEXT,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  additional_notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  calendar_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table for tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Leads are viewable by admin" ON leads
  FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@supportiq.ai');

CREATE POLICY "Leads are insertable by anyone" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Leads are updatable by admin" ON leads
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'admin@supportiq.ai');

-- Demo bookings policies
CREATE POLICY "Demo bookings are viewable by admin" ON demo_bookings
  FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@supportiq.ai');

CREATE POLICY "Demo bookings are insertable by anyone" ON demo_bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Demo bookings are updatable by admin" ON demo_bookings
  FOR UPDATE USING (auth.jwt() ->> 'email' = 'admin@supportiq.ai');

-- Analytics events policies
CREATE POLICY "Analytics events are viewable by admin" ON analytics_events
  FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@supportiq.ai');

CREATE POLICY "Analytics events are insertable by service role" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

CREATE INDEX IF NOT EXISTS idx_demo_bookings_email ON demo_bookings(email);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_status ON demo_bookings(status);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_date ON demo_bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_created_at ON demo_bookings(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_bookings_updated_at BEFORE UPDATE ON demo_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to track landing page views
CREATE OR REPLACE FUNCTION track_landing_page_view()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_events (event_type, event_data)
  VALUES ('landing_page_view', jsonb_build_object(
    'page', 'landing',
    'timestamp', NOW()
  ));
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to track trial signups
CREATE OR REPLACE FUNCTION track_trial_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_events (event_type, user_id, event_data)
  VALUES ('trial_signup', NEW.user_id, jsonb_build_object(
    'trial_id', NEW.id,
    'plan', NEW.plan,
    'timestamp', NOW()
  ));
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to track first AI use
CREATE OR REPLACE FUNCTION track_first_ai_use()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first AI response for this user
  IF NOT EXISTS (
    SELECT 1 FROM ai_responses 
    WHERE user_id = NEW.user_id 
    AND created_at < NEW.created_at
  ) THEN
    INSERT INTO analytics_events (event_type, user_id, event_data)
    VALUES ('first_ai_response', NEW.user_id, jsonb_build_object(
      'response_id', NEW.id,
      'timestamp', NOW()
    ));
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to track trial limit reached
CREATE OR REPLACE FUNCTION track_trial_limit_reached()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.usage_count >= NEW.usage_limit THEN
    INSERT INTO analytics_events (event_type, user_id, event_data)
    VALUES ('trial_limit_reached', NEW.user_id, jsonb_build_object(
      'trial_id', NEW.id,
      'usage_count', NEW.usage_count,
      'usage_limit', NEW.usage_limit,
      'timestamp', NOW()
    ));
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to track subscription conversions
CREATE OR REPLACE FUNCTION track_subscription_conversion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    INSERT INTO analytics_events (event_type, user_id, event_data)
    VALUES ('subscription_conversion', NEW.user_id, jsonb_build_object(
      'subscription_id', NEW.id,
      'plan', NEW.plan,
      'amount', NEW.amount,
      'timestamp', NOW()
    ));
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tracking
CREATE TRIGGER trigger_trial_signup_tracking
  AFTER INSERT ON trials
  FOR EACH ROW EXECUTE FUNCTION track_trial_signup();

CREATE TRIGGER trigger_first_ai_use_tracking
  AFTER INSERT ON ai_responses
  FOR EACH ROW EXECUTE FUNCTION track_first_ai_use();

CREATE TRIGGER trigger_trial_limit_tracking
  AFTER UPDATE ON trials
  FOR EACH ROW EXECUTE FUNCTION track_trial_limit_reached();

CREATE TRIGGER trigger_subscription_conversion_tracking
  AFTER UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION track_subscription_conversion();

-- Views for easier querying
CREATE OR REPLACE VIEW lead_conversion_summary AS
SELECT 
  source,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads,
  ROUND(
    COUNT(CASE WHEN status = 'converted' THEN 1 END)::DECIMAL / COUNT(*) * 100, 2
  ) as conversion_rate
FROM leads
GROUP BY source
ORDER BY total_leads DESC;

CREATE OR REPLACE VIEW demo_booking_summary AS
SELECT 
  DATE(preferred_date) as demo_date,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_demos,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_demos
FROM demo_bookings
WHERE preferred_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(preferred_date)
ORDER BY demo_date DESC;

CREATE OR REPLACE VIEW conversion_funnel_daily AS
SELECT 
  DATE(ae.created_at) as event_date,
  COUNT(CASE WHEN ae.event_type = 'landing_page_view' THEN 1 END) as landing_views,
  COUNT(CASE WHEN ae.event_type = 'trial_signup' THEN 1 END) as trial_signups,
  COUNT(CASE WHEN ae.event_type = 'first_ai_response' THEN 1 END) as first_ai_use,
  COUNT(CASE WHEN ae.event_type = 'trial_limit_reached' THEN 1 END) as limit_reached,
  COUNT(CASE WHEN ae.event_type = 'subscription_conversion' THEN 1 END) as conversions
FROM analytics_events ae
WHERE ae.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(ae.created_at)
ORDER BY event_date DESC; 