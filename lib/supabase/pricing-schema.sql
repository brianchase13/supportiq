-- Pricing and payment related tables

-- Checkout sessions tracking
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  stripe_session_id TEXT,
  plan_id TEXT NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  amount INTEGER NOT NULL,
  projected_savings INTEGER DEFAULT 0,
  ticket_volume INTEGER DEFAULT 0,
  roi_multiplier NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User activations tracking
CREATE TABLE IF NOT EXISTS user_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  ticket_volume INTEGER DEFAULT 0,
  projected_savings INTEGER DEFAULT 0,
  activation_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  analysis_completed_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deflection analyses storage
CREATE TABLE IF NOT EXISTS deflection_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  total_potential_savings INTEGER DEFAULT 0,
  monthly_potential_savings INTEGER DEFAULT 0,
  top_insights_count INTEGER DEFAULT 0,
  parameters JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ticket clustering for deflection analysis
CREATE TABLE IF NOT EXISTS ticket_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cluster_id TEXT NOT NULL,
  ticket_ids TEXT[] NOT NULL,
  centroid VECTOR(1536), -- OpenAI embedding dimension
  category TEXT,
  common_theme TEXT,
  ticket_count INTEGER NOT NULL DEFAULT 0,
  avg_handle_time NUMERIC DEFAULT 0,
  monthly_cost NUMERIC DEFAULT 0,
  annual_cost NUMERIC DEFAULT 0,
  deflection_potential INTEGER DEFAULT 0,
  recommended_action TEXT,
  kb_article_template TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge base articles tracking
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cluster_id UUID REFERENCES ticket_clusters(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  deflected_tickets INTEGER DEFAULT 0,
  estimated_savings NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Deflection tracking - measure actual impact
CREATE TABLE IF NOT EXISTS deflection_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kb_article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  ticket_id UUID,
  deflection_type TEXT NOT NULL, -- 'prevented', 'resolved', 'escalated'
  confidence_score NUMERIC DEFAULT 0,
  savings_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_session_id ON checkout_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_activations_user_id ON user_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_deflection_analyses_user_id ON deflection_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_clusters_user_id ON ticket_clusters(user_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_user_id ON kb_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_deflection_metrics_user_id ON deflection_metrics(user_id);

-- Add missing columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;

-- RLS policies for security
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deflection_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deflection_metrics ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can access their own checkout sessions" ON checkout_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own activations" ON user_activations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own analyses" ON deflection_analyses
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own clusters" ON ticket_clusters
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own KB articles" ON kb_articles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own deflection metrics" ON deflection_metrics
  FOR ALL USING (user_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_checkout_sessions_updated_at
  BEFORE UPDATE ON checkout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_activations_updated_at
  BEFORE UPDATE ON user_activations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_clusters_updated_at
  BEFORE UPDATE ON ticket_clusters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kb_articles_updated_at
  BEFORE UPDATE ON kb_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();