-- Intercom Integration Schema for SupportIQ
-- Based on official Intercom API documentation

-- Add Intercom fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS intercom_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS intercom_workspace_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS intercom_connected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS intercom_refresh_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS intercom_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'conversation',
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id TEXT,
  admin_id TEXT,
  subject TEXT,
  body TEXT,
  tags TEXT[],
  priority TEXT,
  webhook_topic TEXT,
  deflection_score DECIMAL(3,2),
  sentiment TEXT,
  category TEXT,
  raw_data JSONB,
  created_at_app TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'ticket',
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id TEXT,
  admin_id TEXT,
  subject TEXT,
  body TEXT,
  priority TEXT,
  webhook_topic TEXT,
  deflection_score DECIMAL(3,2),
  sentiment TEXT,
  category TEXT,
  raw_data JSONB,
  created_at_app TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create real-time analytics table
CREATE TABLE IF NOT EXISTS analytics_realtime (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  event TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, type, event)
);

-- Create webhook logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deflection analytics table
CREATE TABLE IF NOT EXISTS deflection_analytics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  total_conversations INTEGER DEFAULT 0,
  total_tickets INTEGER DEFAULT 0,
  deflected_conversations INTEGER DEFAULT 0,
  deflected_tickets INTEGER DEFAULT 0,
  deflection_rate DECIMAL(5,2),
  avg_deflection_score DECIMAL(3,2),
  sentiment_distribution JSONB,
  category_distribution JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_category ON conversations(category);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);

CREATE INDEX IF NOT EXISTS idx_analytics_realtime_date ON analytics_realtime(date);
CREATE INDEX IF NOT EXISTS idx_analytics_realtime_type_event ON analytics_realtime(type, event);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_user_id ON webhook_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_at ON webhook_logs(processed_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);

CREATE INDEX IF NOT EXISTS idx_deflection_analytics_user_date ON deflection_analytics(user_id, date);

-- Create RLS policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_realtime ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deflection_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage all conversations" ON conversations
  FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for tickets
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage all tickets" ON tickets
  FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for analytics
CREATE POLICY "Users can view their own analytics" ON analytics_realtime
  FOR SELECT USING (true); -- Analytics are shared across users

CREATE POLICY "Service role can manage all analytics" ON analytics_realtime
  FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for webhook logs
CREATE POLICY "Users can view their own webhook logs" ON webhook_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all webhook logs" ON webhook_logs
  FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for deflection analytics
CREATE POLICY "Users can view their own deflection analytics" ON deflection_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all deflection analytics" ON deflection_analytics
  FOR ALL USING (auth.role() = 'service_role');

-- Create functions for analytics
CREATE OR REPLACE FUNCTION calculate_daily_deflection_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update deflection analytics for the day
  INSERT INTO deflection_analytics (
    user_id,
    date,
    total_conversations,
    total_tickets,
    deflected_conversations,
    deflected_tickets,
    deflection_rate,
    avg_deflection_score,
    sentiment_distribution,
    category_distribution
  )
  SELECT 
    u.id as user_id,
    CURRENT_DATE as date,
    COALESCE(conv_stats.total_conversations, 0) as total_conversations,
    COALESCE(ticket_stats.total_tickets, 0) as total_tickets,
    COALESCE(conv_stats.deflected_conversations, 0) as deflected_conversations,
    COALESCE(ticket_stats.deflected_tickets, 0) as deflected_tickets,
    CASE 
      WHEN (COALESCE(conv_stats.total_conversations, 0) + COALESCE(ticket_stats.total_tickets, 0)) > 0 
      THEN ROUND(
        (COALESCE(conv_stats.deflected_conversations, 0) + COALESCE(ticket_stats.deflected_tickets, 0))::DECIMAL / 
        (COALESCE(conv_stats.total_conversations, 0) + COALESCE(ticket_stats.total_tickets, 0)) * 100, 2
      )
      ELSE 0 
    END as deflection_rate,
    COALESCE(avg_score.avg_deflection_score, 0) as avg_deflection_score,
    sentiment_stats.sentiment_distribution,
    category_stats.category_distribution
  FROM users u
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(*) as total_conversations,
      COUNT(*) FILTER (WHERE deflection_score >= 0.7) as deflected_conversations
    FROM conversations 
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY user_id
  ) conv_stats ON u.id::text = conv_stats.user_id
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(*) as total_tickets,
      COUNT(*) FILTER (WHERE deflection_score >= 0.7) as deflected_tickets
    FROM tickets 
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY user_id
  ) ticket_stats ON u.id::text = ticket_stats.user_id
  LEFT JOIN (
    SELECT 
      AVG(deflection_score) as avg_deflection_score
    FROM (
      SELECT deflection_score FROM conversations WHERE DATE(created_at) = CURRENT_DATE
      UNION ALL
      SELECT deflection_score FROM tickets WHERE DATE(created_at) = CURRENT_DATE
    ) all_items
  ) avg_score ON true
  LEFT JOIN (
    SELECT 
      jsonb_object_agg(sentiment, count) as sentiment_distribution
    FROM (
      SELECT sentiment, COUNT(*) as count
      FROM (
        SELECT sentiment FROM conversations WHERE DATE(created_at) = CURRENT_DATE
        UNION ALL
        SELECT sentiment FROM tickets WHERE DATE(created_at) = CURRENT_DATE
      ) all_sentiments
      GROUP BY sentiment
    ) sentiment_counts
  ) sentiment_stats ON true
  LEFT JOIN (
    SELECT 
      jsonb_object_agg(category, count) as category_distribution
    FROM (
      SELECT category, COUNT(*) as count
      FROM (
        SELECT category FROM conversations WHERE DATE(created_at) = CURRENT_DATE
        UNION ALL
        SELECT category FROM tickets WHERE DATE(created_at) = CURRENT_DATE
      ) all_categories
      GROUP BY category
    ) category_counts
  ) category_stats ON true
  WHERE u.id = COALESCE(NEW.user_id::uuid, OLD.user_id::uuid)
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_conversations = EXCLUDED.total_conversations,
    total_tickets = EXCLUDED.total_tickets,
    deflected_conversations = EXCLUDED.deflected_conversations,
    deflected_tickets = EXCLUDED.deflected_tickets,
    deflection_rate = EXCLUDED.deflection_rate,
    avg_deflection_score = EXCLUDED.avg_deflection_score,
    sentiment_distribution = EXCLUDED.sentiment_distribution,
    category_distribution = EXCLUDED.category_distribution,
    updated_at = NOW();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic analytics updates
CREATE TRIGGER trigger_update_deflection_analytics_conversations
  AFTER INSERT OR UPDATE OR DELETE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_daily_deflection_analytics();

CREATE TRIGGER trigger_update_deflection_analytics_tickets
  AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION calculate_daily_deflection_analytics();

-- Grant permissions
GRANT ALL ON conversations TO service_role;
GRANT ALL ON tickets TO service_role;
GRANT ALL ON analytics_realtime TO service_role;
GRANT ALL ON webhook_logs TO service_role;
GRANT ALL ON deflection_analytics TO service_role;

GRANT SELECT ON conversations TO authenticated;
GRANT SELECT ON tickets TO authenticated;
GRANT SELECT ON analytics_realtime TO authenticated;
GRANT SELECT ON webhook_logs TO authenticated;
GRANT SELECT ON deflection_analytics TO authenticated; 