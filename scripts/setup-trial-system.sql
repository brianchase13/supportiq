-- SupportIQ Trial System Setup Script
-- Run this in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trials table
CREATE TABLE IF NOT EXISTS trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'converted', 'cancelled')),
  limits JSONB NOT NULL DEFAULT '{}',
  usage JSONB NOT NULL DEFAULT '{}',
  conversion_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI responses table
CREATE TABLE IF NOT EXISTS ai_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_content TEXT NOT NULL,
  response_type TEXT NOT NULL CHECK (response_type IN ('auto_resolve', 'follow_up', 'escalate')),
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning TEXT,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10,6) NOT NULL DEFAULT 0,
  suggested_actions JSONB,
  follow_up_required BOOLEAN DEFAULT false,
  escalation_triggers JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge base articles
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Response templates
CREATE TABLE IF NOT EXISTS response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversation messages for context
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trial usage tracking
CREATE TABLE IF NOT EXISTS trial_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 1,
  previous_usage JSONB,
  new_usage JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trials_user_id ON trials(user_id);
CREATE INDEX IF NOT EXISTS idx_trials_status ON trials(status);
CREATE INDEX IF NOT EXISTS idx_trials_expires_at ON trials(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_responses_user_id ON ai_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_ticket_id ON ai_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_user_id ON knowledge_base(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_response_templates_user_id ON response_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_response_templates_category ON response_templates(category);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_trial_usage_logs_user_id ON trial_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_usage_logs_trial_id ON trial_usage_logs(trial_id);

-- Add missing columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_converted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_expired_at TIMESTAMPTZ;

-- RLS policies for security
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can access their own trials" ON trials
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own AI responses" ON ai_responses
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own knowledge base" ON knowledge_base
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own response templates" ON response_templates
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own conversation messages" ON conversation_messages
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own trial usage logs" ON trial_usage_logs
  FOR ALL USING (user_id = auth.uid());

-- Functions for trial management
CREATE OR REPLACE FUNCTION update_trial_usage(
  p_user_id UUID,
  p_operation TEXT,
  p_amount INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
  UPDATE trials 
  SET usage = usage || jsonb_build_object(p_operation, COALESCE((usage->>p_operation)::int, 0) + p_amount),
      updated_at = now()
  WHERE user_id = p_user_id AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to check trial expiration
CREATE OR REPLACE FUNCTION check_trial_expiration() RETURNS VOID AS $$
BEGIN
  UPDATE trials 
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'active' AND expires_at < now();
  
  UPDATE users 
  SET subscription_status = 'expired',
      trial_expired_at = now()
  WHERE id IN (
    SELECT user_id FROM trials 
    WHERE status = 'expired' AND updated_at > now() - interval '1 minute'
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trials_updated_at BEFORE UPDATE ON trials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_response_templates_updated_at BEFORE UPDATE ON response_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample knowledge base articles for testing
INSERT INTO knowledge_base (user_id, title, content, category, tags, status) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Password Reset Guide', 'To reset your password, go to the login page and click "Forgot Password". Enter your email address and follow the instructions sent to your email.', 'account', ARRAY['password', 'reset', 'login'], 'active'),
  ('00000000-0000-0000-0000-000000000000', 'Billing FAQ', 'For billing questions, please check your invoice in the billing section. You can update payment methods and view transaction history there.', 'billing', ARRAY['billing', 'payment', 'invoice'], 'active'),
  ('00000000-0000-0000-0000-000000000000', 'Getting Started Guide', 'Welcome to our platform! Start by completing your profile and exploring the main features. Our support team is here to help.', 'general', ARRAY['getting-started', 'onboarding', 'welcome'], 'active')
ON CONFLICT DO NOTHING;

-- Insert sample response templates
INSERT INTO response_templates (user_id, name, content, category, tags, status) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Password Reset Response', 'Hi there! I can help you reset your password. Please visit our password reset page at [link] and follow the instructions. Let me know if you need any further assistance!', 'account', ARRAY['password', 'reset'], 'active'),
  ('00000000-0000-0000-0000-000000000000', 'Billing Inquiry Response', 'Thank you for reaching out about your billing. I can see your recent charges in our system. The charge you mentioned is for [service]. You can view detailed invoices in your billing dashboard.', 'billing', ARRAY['billing', 'charges'], 'active'),
  ('00000000-0000-0000-0000-000000000000', 'Feature Request Response', 'Thank you for your feature request! This is a great idea and we appreciate you taking the time to share it. I\'ve logged this request and our product team will review it.', 'feature_request', ARRAY['feature', 'request'], 'active')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 