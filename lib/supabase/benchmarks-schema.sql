-- Benchmarks and competitive intelligence schema

-- Store anonymized benchmark data
CREATE TABLE IF NOT EXISTS benchmark_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_size TEXT NOT NULL, -- 'small', 'medium', 'large', 'enterprise'
  industry TEXT,
  region TEXT NOT NULL DEFAULT 'global',
  response_time INTEGER NOT NULL,
  ticket_volume INTEGER NOT NULL,
  satisfaction INTEGER NOT NULL, -- 0-100 scale
  deflection_rate INTEGER NOT NULL, -- 0-100 scale
  agent_count INTEGER,
  monthly_revenue INTEGER, -- Anonymized revenue bucket
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Benchmark access logs for analytics
CREATE TABLE IF NOT EXISTS benchmark_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_size TEXT,
  industry TEXT,
  region TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User benchmark preferences
CREATE TABLE IF NOT EXISTS user_benchmark_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  company_size TEXT,
  industry TEXT,
  region TEXT DEFAULT 'global',
  auto_generate_reports BOOLEAN DEFAULT false,
  email_frequency TEXT DEFAULT 'monthly', -- 'weekly', 'monthly', 'quarterly'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Benchmark reports storage
CREATE TABLE IF NOT EXISTS benchmark_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'custom'
  report_data JSONB NOT NULL,
  overall_score INTEGER NOT NULL,
  improvement_opportunities JSONB NOT NULL,
  competitive_position JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Industry insights and trends
CREATE TABLE IF NOT EXISTS industry_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  insight_type TEXT NOT NULL, -- 'trend', 'benchmark', 'best_practice'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_score INTEGER NOT NULL, -- 1-10 scale
  action_items JSONB NOT NULL,
  data_points JSONB NOT NULL,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Competitive intelligence
CREATE TABLE IF NOT EXISTS competitive_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  company_size TEXT NOT NULL,
  industry TEXT,
  region TEXT NOT NULL,
  percentile_25 NUMERIC NOT NULL,
  percentile_50 NUMERIC NOT NULL,
  percentile_75 NUMERIC NOT NULL,
  percentile_90 NUMERIC NOT NULL,
  average_value NUMERIC NOT NULL,
  sample_size INTEGER NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_benchmark_data_size_industry ON benchmark_data(company_size, industry);
CREATE INDEX IF NOT EXISTS idx_benchmark_data_region ON benchmark_data(region);
CREATE INDEX IF NOT EXISTS idx_benchmark_access_logs_user ON benchmark_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_reports_user ON benchmark_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_industry_insights_industry ON industry_insights(industry);
CREATE INDEX IF NOT EXISTS idx_competitive_intelligence_lookup ON competitive_intelligence(metric_name, company_size, industry, region);

-- RLS policies
ALTER TABLE benchmark_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_benchmark_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_intelligence ENABLE ROW LEVEL SECURITY;

-- Users can only access their own benchmark data
CREATE POLICY "Users can access their own benchmark logs" ON benchmark_access_logs
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own benchmark settings" ON user_benchmark_settings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own benchmark reports" ON benchmark_reports
  FOR ALL USING (user_id = auth.uid());

-- Benchmark data is read-only and anonymized
CREATE POLICY "Benchmark data is publicly readable" ON benchmark_data
  FOR SELECT USING (true);

CREATE POLICY "Industry insights are publicly readable" ON industry_insights
  FOR SELECT USING (true);

CREATE POLICY "Competitive intelligence is publicly readable" ON competitive_intelligence
  FOR SELECT USING (true);

-- Functions for anonymizing data contributions
CREATE OR REPLACE FUNCTION contribute_benchmark_data(
  p_user_id UUID,
  p_company_size TEXT,
  p_industry TEXT,
  p_region TEXT,
  p_response_time INTEGER,
  p_ticket_volume INTEGER,
  p_satisfaction INTEGER,
  p_deflection_rate INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Insert anonymized data
  INSERT INTO benchmark_data (
    company_size,
    industry,
    region,
    response_time,
    ticket_volume,
    satisfaction,
    deflection_rate,
    agent_count,
    monthly_revenue
  ) VALUES (
    p_company_size,
    p_industry,
    p_region,
    p_response_time,
    p_ticket_volume,
    p_satisfaction,
    p_deflection_rate,
    -- Anonymized values
    CASE 
      WHEN p_ticket_volume < 100 THEN 1
      WHEN p_ticket_volume < 500 THEN 2
      WHEN p_ticket_volume < 2000 THEN 3
      ELSE 4
    END,
    -- Revenue bucket based on company size
    CASE p_company_size
      WHEN 'small' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'large' THEN 3
      ELSE 4
    END
  );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate industry percentiles
CREATE OR REPLACE FUNCTION calculate_industry_percentiles(
  p_metric_name TEXT,
  p_company_size TEXT,
  p_industry TEXT,
  p_region TEXT
) RETURNS TABLE (
  percentile_25 NUMERIC,
  percentile_50 NUMERIC,
  percentile_75 NUMERIC,
  percentile_90 NUMERIC,
  average_value NUMERIC,
  sample_size INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    percentile_cont(0.25) WITHIN GROUP (ORDER BY 
      CASE p_metric_name
        WHEN 'response_time' THEN response_time::NUMERIC
        WHEN 'ticket_volume' THEN ticket_volume::NUMERIC
        WHEN 'satisfaction' THEN satisfaction::NUMERIC
        WHEN 'deflection_rate' THEN deflection_rate::NUMERIC
      END
    ) AS percentile_25,
    percentile_cont(0.50) WITHIN GROUP (ORDER BY 
      CASE p_metric_name
        WHEN 'response_time' THEN response_time::NUMERIC
        WHEN 'ticket_volume' THEN ticket_volume::NUMERIC
        WHEN 'satisfaction' THEN satisfaction::NUMERIC
        WHEN 'deflection_rate' THEN deflection_rate::NUMERIC
      END
    ) AS percentile_50,
    percentile_cont(0.75) WITHIN GROUP (ORDER BY 
      CASE p_metric_name
        WHEN 'response_time' THEN response_time::NUMERIC
        WHEN 'ticket_volume' THEN ticket_volume::NUMERIC
        WHEN 'satisfaction' THEN satisfaction::NUMERIC
        WHEN 'deflection_rate' THEN deflection_rate::NUMERIC
      END
    ) AS percentile_75,
    percentile_cont(0.90) WITHIN GROUP (ORDER BY 
      CASE p_metric_name
        WHEN 'response_time' THEN response_time::NUMERIC
        WHEN 'ticket_volume' THEN ticket_volume::NUMERIC
        WHEN 'satisfaction' THEN satisfaction::NUMERIC
        WHEN 'deflection_rate' THEN deflection_rate::NUMERIC
      END
    ) AS percentile_90,
    AVG(
      CASE p_metric_name
        WHEN 'response_time' THEN response_time::NUMERIC
        WHEN 'ticket_volume' THEN ticket_volume::NUMERIC
        WHEN 'satisfaction' THEN satisfaction::NUMERIC
        WHEN 'deflection_rate' THEN deflection_rate::NUMERIC
      END
    ) AS average_value,
    COUNT(*)::INTEGER AS sample_size
  FROM benchmark_data
  WHERE 
    company_size = p_company_size
    AND (p_industry IS NULL OR industry = p_industry)
    AND region = p_region
    AND created_at >= NOW() - INTERVAL '90 days'; -- Only recent data
END;
$$ LANGUAGE plpgsql;

-- Seed some initial benchmark data
INSERT INTO benchmark_data (company_size, industry, region, response_time, ticket_volume, satisfaction, deflection_rate, agent_count, monthly_revenue) VALUES
-- Small companies
('small', 'SaaS', 'global', 65, 120, 78, 25, 1, 1),
('small', 'E-commerce', 'global', 85, 180, 72, 20, 1, 1),
('small', 'Healthcare', 'global', 45, 90, 85, 35, 1, 1),
('small', 'Finance', 'global', 35, 150, 88, 40, 1, 1),
-- Medium companies
('medium', 'SaaS', 'global', 45, 450, 82, 40, 2, 2),
('medium', 'E-commerce', 'global', 65, 650, 79, 35, 2, 2),
('medium', 'Healthcare', 'global', 35, 300, 89, 45, 2, 2),
('medium', 'Finance', 'global', 25, 400, 92, 50, 2, 2),
-- Large companies
('large', 'SaaS', 'global', 35, 1200, 85, 50, 3, 3),
('large', 'E-commerce', 'global', 45, 1800, 83, 45, 3, 3),
('large', 'Healthcare', 'global', 25, 800, 91, 55, 3, 3),
('large', 'Finance', 'global', 20, 1000, 94, 60, 3, 3),
-- Enterprise companies
('enterprise', 'SaaS', 'global', 25, 5000, 88, 60, 4, 4),
('enterprise', 'E-commerce', 'global', 35, 8000, 86, 55, 4, 4),
('enterprise', 'Healthcare', 'global', 18, 3000, 93, 65, 4, 4),
('enterprise', 'Finance', 'global', 15, 4000, 96, 70, 4, 4);

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_benchmark_data_updated_at
  BEFORE UPDATE ON benchmark_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_benchmark_settings_updated_at
  BEFORE UPDATE ON user_benchmark_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();