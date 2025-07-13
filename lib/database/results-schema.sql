-- Customer Results Tracking Schema
-- This stores real-time customer success metrics for ROI validation

-- Create customer_results table
CREATE TABLE IF NOT EXISTS customer_results (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Core performance metrics (JSONB for flexible schema)
  metrics JSONB NOT NULL DEFAULT '{}',
  
  -- Daily historical data (JSONB array)
  daily_metrics JSONB NOT NULL DEFAULT '[]',
  
  -- Customer feedback and testimonial data
  feedback JSONB NOT NULL DEFAULT '{
    "rating": 0,
    "quote": null,
    "isTestimonial": false,
    "caseStudyConsent": false
  }',
  
  -- Tracking metadata
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Indexes for performance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_results_user_id ON customer_results(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_results_active ON customer_results(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_results_updated ON customer_results(last_updated);
CREATE INDEX IF NOT EXISTS idx_customer_results_company ON customer_results(company);

-- Create GIN index for JSONB metrics queries
CREATE INDEX IF NOT EXISTS idx_customer_results_metrics ON customer_results USING GIN (metrics);
CREATE INDEX IF NOT EXISTS idx_customer_results_feedback ON customer_results USING GIN (feedback);

-- Create view for easy analytics queries
CREATE OR REPLACE VIEW customer_results_summary AS
SELECT 
  cr.user_id,
  cr.company,
  cr.email,
  cr.is_active,
  cr.last_updated,
  cr.data_points,
  
  -- Extract key metrics from JSONB
  COALESCE((cr.metrics->>'totalTickets')::numeric, 0) as total_tickets,
  COALESCE((cr.metrics->>'deflectedTickets')::numeric, 0) as deflected_tickets,
  COALESCE((cr.metrics->>'deflectionRate')::numeric, 0) as deflection_rate,
  COALESCE((cr.metrics->>'totalSavings')::numeric, 0) as total_savings,
  COALESCE((cr.metrics->>'monthlySavings')::numeric, 0) as monthly_savings,
  COALESCE((cr.metrics->>'satisfactionImprovement')::numeric, 0) as satisfaction_improvement,
  COALESCE((cr.metrics->>'timeToFirstValue')::numeric, 0) as time_to_first_value,
  
  -- Extract feedback data
  COALESCE((cr.feedback->>'rating')::numeric, 0) as feedback_rating,
  COALESCE((cr.feedback->>'isTestimonial')::boolean, false) as is_testimonial,
  COALESCE((cr.feedback->>'caseStudyConsent')::boolean, false) as case_study_consent,
  cr.feedback->>'quote' as testimonial_quote,
  
  -- Calculate readiness scores
  CASE 
    WHEN COALESCE((cr.metrics->>'deflectionRate')::numeric, 0) > 40 
     AND COALESCE((cr.metrics->>'totalSavings')::numeric, 0) > 500
     AND COALESCE((cr.metrics->>'satisfactionImprovement')::numeric, 0) > 0.5
     AND cr.data_points > 10
     AND COALESCE((cr.feedback->>'isTestimonial')::boolean, false) = false
    THEN true 
    ELSE false 
  END as testimonial_ready,
  
  CASE 
    WHEN COALESCE((cr.metrics->>'deflectionRate')::numeric, 0) > 60 
     AND COALESCE((cr.metrics->>'totalSavings')::numeric, 0) > 2000
     AND COALESCE((cr.feedback->>'rating')::numeric, 0) >= 4
    THEN true 
    ELSE false 
  END as case_study_ready
  
FROM customer_results cr
WHERE cr.is_active = true;

-- Create function to update timestamp on record change
CREATE OR REPLACE FUNCTION update_customer_results_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS update_customer_results_timestamp ON customer_results;
CREATE TRIGGER update_customer_results_timestamp
  BEFORE UPDATE ON customer_results
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_results_timestamp();

-- Sample data structure for metrics JSONB field:
/*
{
  "totalTickets": 1500,
  "deflectedTickets": 1020,
  "deflectionRate": 68.0,
  "avgResponseTimeBefore": 8.5,
  "avgResponseTimeAfter": 2.3,
  "timeSavedHours": 156,
  "costPerTicket": 15,
  "monthlySavings": 15300,
  "totalSavings": 45900,
  "satisfactionBefore": 3.2,
  "satisfactionAfter": 4.5,
  "satisfactionImprovement": 1.3,
  "timeToFirstValue": 7,
  "featureAdoption": {
    "aiDeflection": true,
    "realTimeAnalytics": true,
    "customWorkflows": false
  }
}
*/

-- Sample data structure for daily_metrics JSONB array:
/*
[
  {
    "date": "2024-01-15",
    "ticketsProcessed": 45,
    "ticketsDeflected": 31,
    "customerSatisfaction": 4.2,
    "costSavings": 465
  },
  {
    "date": "2024-01-16",
    "ticketsProcessed": 52,
    "ticketsDeflected": 38,
    "customerSatisfaction": 4.4,
    "costSavings": 570
  }
]
*/

-- Sample data structure for feedback JSONB field:
/*
{
  "rating": 5,
  "quote": "SupportIQ transformed our customer support. We're now deflecting 68% of tickets automatically while improving customer satisfaction.",
  "isTestimonial": true,
  "caseStudyConsent": true
}
*/

-- Create function to get aggregate metrics
CREATE OR REPLACE FUNCTION get_results_aggregate_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalCustomers', COUNT(*),
    'avgDeflectionRate', ROUND(AVG(deflection_rate)::numeric, 1),
    'totalSavings', ROUND(SUM(total_savings)::numeric),
    'avgSatisfactionImprovement', ROUND(AVG(satisfaction_improvement)::numeric, 1),
    'testimonialsReady', COUNT(*) FILTER (WHERE testimonial_ready = true),
    'caseStudiesReady', COUNT(*) FILTER (WHERE case_study_ready = true),
    'lastUpdated', MAX(last_updated)
  ) INTO result
  FROM customer_results_summary;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to get top performers
CREATE OR REPLACE FUNCTION get_top_performers(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  user_id TEXT,
  company TEXT,
  email TEXT,
  deflection_rate NUMERIC,
  total_savings NUMERIC,
  satisfaction_improvement NUMERIC,
  performance_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    crs.user_id,
    crs.company,
    crs.email,
    crs.deflection_rate,
    crs.total_savings,
    crs.satisfaction_improvement,
    -- Calculate performance score
    (crs.deflection_rate * 0.4 + 
     crs.total_savings * 0.001 + 
     crs.satisfaction_improvement * 20 +
     crs.data_points * 0.1) as performance_score
  FROM customer_results_summary crs
  WHERE crs.total_savings > 100 -- Minimum savings threshold
  ORDER BY performance_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get testimonial candidates
CREATE OR REPLACE FUNCTION get_testimonial_candidates()
RETURNS TABLE (
  user_id TEXT,
  company TEXT,
  email TEXT,
  deflection_rate NUMERIC,
  total_savings NUMERIC,
  satisfaction_improvement NUMERIC,
  data_points INTEGER,
  feedback_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    crs.user_id,
    crs.company,
    crs.email,
    crs.deflection_rate,
    crs.total_savings,
    crs.satisfaction_improvement,
    crs.data_points,
    crs.feedback_rating
  FROM customer_results_summary crs
  WHERE crs.testimonial_ready = true
  ORDER BY crs.total_savings DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON customer_results TO authenticated;
GRANT ALL ON customer_results_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_results_aggregate_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_performers(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_testimonial_candidates() TO authenticated;