-- SupportIQ Database Setup
-- Run this entire file in Supabase SQL Editor
-- This combines all schema files in the correct order

-- ========================================
-- 1. MAIN SCHEMA (lib/supabase/schema.sql)
-- ========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table for authentication and Intercom integration
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  intercom_access_token text,
  intercom_workspace_id text,
  subscription_status text default 'trial',
  subscription_plan text default 'starter',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on users table
alter table users enable row level security;

-- Create policy for users to only see their own data
create policy "Users can only see their own data" on users
  for all using (auth.uid() = id);

-- Cached ticket data from Intercom
create table if not exists tickets (
  id text primary key,
  user_id uuid references users(id) on delete cascade,
  intercom_conversation_id text not null,
  content text,
  subject text,
  category text,
  sentiment text,
  sentiment_score decimal(3,2), -- -1.0 to 1.0
  response_time_minutes integer,
  satisfaction_score integer, -- 1-5 scale
  agent_name text,
  agent_email text,
  customer_email text,
  status text, -- 'open', 'closed', 'snoozed'
  priority text, -- 'not_priority', 'priority'
  assignee_type text, -- 'admin', 'team'
  tags text[], -- Array of tags
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  synced_at timestamp with time zone default now()
);

-- Enable RLS on tickets table
alter table tickets enable row level security;

-- Create policy for tickets
create policy "Users can only see their own tickets" on tickets
  for all using (auth.uid() = user_id);

-- AI-generated insights
create table if not exists insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  type text not null, -- 'issue_pattern', 'performance', 'prediction', 'prevention'
  title text not null,
  description text not null,
  impact_score integer check (impact_score >= 0 and impact_score <= 100),
  potential_savings text, -- e.g., "30% ticket reduction"
  action_items jsonb,
  data_source jsonb, -- Supporting data for the insight
  status text default 'active', -- 'active', 'dismissed', 'implemented'
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on insights table
alter table insights enable row level security;

-- Create policy for insights
create policy "Users can only see their own insights" on insights
  for all using (auth.uid() = user_id);

-- Sync logs to track data synchronization
create table if not exists sync_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  sync_type text not null, -- 'tickets', 'insights'
  status text not null, -- 'success', 'error', 'in_progress'
  records_processed integer default 0,
  error_message text,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- Enable RLS on sync_logs table
alter table sync_logs enable row level security;

-- Create policy for sync_logs
create policy "Users can only see their own sync logs" on sync_logs
  for all using (auth.uid() = user_id);

-- AI responses and their outcomes for ticket deflection
create table if not exists ai_responses (
  id uuid primary key default uuid_generate_v4(),
  ticket_id text references tickets(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  response_content text not null,
  response_type text not null check (response_type in ('auto_resolve', 'escalate', 'follow_up')),
  confidence_score decimal(3,2) check (confidence_score >= 0.0 and confidence_score <= 1.0),
  customer_satisfied boolean,
  customer_feedback text,
  tokens_used integer,
  cost_usd decimal(10,4),
  sent_to_intercom boolean default false,
  intercom_message_id text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on ai_responses table
alter table ai_responses enable row level security;

-- Create policy for ai_responses
create policy "Users can only see their own AI responses" on ai_responses
  for all using (auth.uid() = user_id);

-- Knowledge base articles generated from ticket patterns
create table if not exists knowledge_base (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null,
  tags text[],
  usage_count integer default 0,
  success_rate decimal(3,2) check (success_rate >= 0.0 and success_rate <= 1.0),
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on knowledge_base table
alter table knowledge_base enable row level security;

-- Create policy for knowledge_base
create policy "Users can only see their own knowledge base" on knowledge_base
  for all using (auth.uid() = user_id);

-- Response templates for common issues
create table if not exists response_templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  category text not null,
  template_content text not null,
  variables jsonb, -- Dynamic variables like {customer_name}, {product_name}
  usage_count integer default 0,
  success_rate decimal(3,2) check (success_rate >= 0.0 and success_rate <= 1.0),
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on response_templates table
alter table response_templates enable row level security;

-- Create policy for response_templates
create policy "Users can only see their own response templates" on response_templates
  for all using (auth.uid() = user_id);

-- Ticket deflection metrics for analytics
create table if not exists deflection_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  total_tickets integer default 0,
  auto_resolved integer default 0,
  escalated integer default 0,
  customer_satisfaction decimal(3,2) check (customer_satisfaction >= 0.0 and customer_satisfaction <= 1.0),
  avg_response_time_minutes integer,
  cost_savings_usd decimal(10,2),
  deflection_rate decimal(3,2) check (deflection_rate >= 0.0 and deflection_rate <= 1.0),
  created_at timestamp with time zone default now()
);

-- Enable RLS on deflection_metrics table
alter table deflection_metrics enable row level security;

-- Create policy for deflection_metrics
create policy "Users can only see their own deflection metrics" on deflection_metrics
  for all using (auth.uid() = user_id);

-- User settings for deflection configuration
create table if not exists deflection_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  auto_deflect_enabled boolean default true,
  confidence_threshold decimal(3,2) default 0.8,
  max_tokens_per_response integer default 500,
  allowed_categories text[],
  blocked_keywords text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on deflection_settings table
alter table deflection_settings enable row level security;

-- Create policy for deflection_settings
create policy "Users can only see their own deflection settings" on deflection_settings
  for all using (auth.uid() = user_id);

-- ========================================
-- 2. TRIAL SCHEMA (lib/supabase/trial-schema.sql)
-- ========================================

-- Trial management table
create table if not exists trials (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  started_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null,
  status text default 'active' check (status in ('active', 'expired', 'converted')),
  features_used text[],
  conversion_reason text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on trials table
alter table trials enable row level security;

-- Create policy for trials
create policy "Users can only see their own trial data" on trials
  for all using (auth.uid() = user_id);

-- Trial usage tracking
create table if not exists trial_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  feature text not null,
  usage_count integer default 1,
  last_used_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS on trial_usage table
alter table trial_usage enable row level security;

-- Create policy for trial_usage
create policy "Users can only see their own trial usage" on trial_usage
  for all using (auth.uid() = user_id);

-- ========================================
-- 3. SUBSCRIPTION SCHEMA (lib/supabase/subscription-schema.sql)
-- ========================================

-- Subscription management
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  plan_name text not null,
  status text not null check (status in ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on subscriptions table
alter table subscriptions enable row level security;

-- Create policy for subscriptions
create policy "Users can only see their own subscriptions" on subscriptions
  for all using (auth.uid() = user_id);

-- Subscription usage tracking
create table if not exists subscription_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete cascade,
  feature text not null,
  usage_count integer default 0,
  limit_count integer,
  reset_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on subscription_usage table
alter table subscription_usage enable row level security;

-- Create policy for subscription_usage
create policy "Users can only see their own subscription usage" on subscription_usage
  for all using (auth.uid() = user_id);

-- ========================================
-- 4. ANALYTICS SCHEMA (lib/supabase/analytics-schema.sql)
-- ========================================

-- Analytics events tracking
create table if not exists analytics_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  event_name text not null,
  event_data jsonb,
  session_id text,
  user_agent text,
  ip_address inet,
  created_at timestamp with time zone default now()
);

-- Enable RLS on analytics_events table
alter table analytics_events enable row level security;

-- Create policy for analytics_events
create policy "Users can only see their own analytics events" on analytics_events
  for all using (auth.uid() = user_id);

-- Performance metrics
create table if not exists performance_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  metric_name text not null,
  metric_value decimal(10,4),
  metric_unit text,
  context jsonb,
  recorded_at timestamp with time zone default now()
);

-- Enable RLS on performance_metrics table
alter table performance_metrics enable row level security;

-- Create policy for performance_metrics
create policy "Users can only see their own performance metrics" on performance_metrics
  for all using (auth.uid() = user_id);

-- ========================================
-- 5. DEFLECTION SCHEMA (lib/supabase/deflection-schema.sql)
-- ========================================

-- Deflection queue for processing
create table if not exists deflection_queue (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  ticket_id text references tickets(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  priority integer default 1,
  attempts integer default 0,
  max_attempts integer default 3,
  error_message text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Enable RLS on deflection_queue table
alter table deflection_queue enable row level security;

-- Create policy for deflection_queue
create policy "Users can only see their own deflection queue" on deflection_queue
  for all using (auth.uid() = user_id);

-- ========================================
-- 6. QUEUE SCHEMA (lib/supabase/queue-schema.sql)
-- ========================================

-- Background job queue
create table if not exists job_queue (
  id uuid primary key default uuid_generate_v4(),
  job_type text not null,
  job_data jsonb,
  status text default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  priority integer default 1,
  attempts integer default 0,
  max_attempts integer default 3,
  error_message text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- No RLS on job_queue as it's system-wide

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Main schema indexes
create index if not exists idx_tickets_user_id on tickets(user_id);
create index if not exists idx_tickets_created_at on tickets(created_at desc);
create index if not exists idx_tickets_category on tickets(category);
create index if not exists idx_tickets_sentiment on tickets(sentiment);
create index if not exists idx_tickets_status on tickets(status);

create index if not exists idx_insights_user_id on insights(user_id);
create index if not exists idx_insights_type on insights(type);
create index if not exists idx_insights_status on insights(status);
create index if not exists idx_insights_created_at on insights(created_at desc);

create index if not exists idx_sync_logs_user_id on sync_logs(user_id);
create index if not exists idx_sync_logs_created_at on sync_logs(started_at desc);

create index if not exists idx_ai_responses_user_id on ai_responses(user_id);
create index if not exists idx_ai_responses_ticket_id on ai_responses(ticket_id);
create index if not exists idx_ai_responses_created_at on ai_responses(created_at desc);
create index if not exists idx_ai_responses_confidence on ai_responses(confidence_score desc);

create index if not exists idx_knowledge_base_user_id on knowledge_base(user_id);
create index if not exists idx_knowledge_base_category on knowledge_base(category);
create index if not exists idx_knowledge_base_tags on knowledge_base using gin(tags);
create index if not exists idx_knowledge_base_active on knowledge_base(is_active);

create index if not exists idx_response_templates_user_id on response_templates(user_id);
create index if not exists idx_response_templates_category on response_templates(category);
create index if not exists idx_response_templates_active on response_templates(is_active);

create index if not exists idx_deflection_metrics_user_id on deflection_metrics(user_id);
create index if not exists idx_deflection_metrics_date on deflection_metrics(date desc);

create index if not exists idx_deflection_settings_user_id on deflection_settings(user_id);

-- Trial indexes
create index if not exists idx_trials_user_id on trials(user_id);
create index if not exists idx_trials_status on trials(status);
create index if not exists idx_trials_expires_at on trials(expires_at);

create index if not exists idx_trial_usage_user_id on trial_usage(user_id);
create index if not exists idx_trial_usage_feature on trial_usage(feature);

-- Subscription indexes
create index if not exists idx_subscriptions_user_id on subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_id on subscriptions(stripe_subscription_id);
create index if not exists idx_subscriptions_status on subscriptions(status);

create index if not exists idx_subscription_usage_user_id on subscription_usage(user_id);
create index if not exists idx_subscription_usage_subscription_id on subscription_usage(subscription_id);

-- Analytics indexes
create index if not exists idx_analytics_events_user_id on analytics_events(user_id);
create index if not exists idx_analytics_events_event_name on analytics_events(event_name);
create index if not exists idx_analytics_events_created_at on analytics_events(created_at desc);

create index if not exists idx_performance_metrics_user_id on performance_metrics(user_id);
create index if not exists idx_performance_metrics_name on performance_metrics(metric_name);
create index if not exists idx_performance_metrics_recorded_at on performance_metrics(recorded_at desc);

-- Deflection indexes
create index if not exists idx_deflection_queue_user_id on deflection_queue(user_id);
create index if not exists idx_deflection_queue_status on deflection_queue(status);
create index if not exists idx_deflection_queue_priority on deflection_queue(priority desc);

-- Job queue indexes
create index if not exists idx_job_queue_status on job_queue(status);
create index if not exists idx_job_queue_priority on job_queue(priority desc);
create index if not exists idx_job_queue_created_at on job_queue(created_at desc);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for all tables with updated_at
create trigger update_users_updated_at before update on users
  for each row execute function update_updated_at_column();

create trigger update_insights_updated_at before update on insights
  for each row execute function update_updated_at_column();

create trigger update_knowledge_base_updated_at before update on knowledge_base
  for each row execute function update_updated_at_column();

create trigger update_response_templates_updated_at before update on response_templates
  for each row execute function update_updated_at_column();

create trigger update_deflection_settings_updated_at before update on deflection_settings
  for each row execute function update_updated_at_column();

create trigger update_subscriptions_updated_at before update on subscriptions
  for each row execute function update_updated_at_column();

create trigger update_subscription_usage_updated_at before update on subscription_usage
  for each row execute function update_updated_at_column();

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

-- This will show a success message when the script completes
do $$
begin
  raise notice '✅ SupportIQ database setup completed successfully!';
  raise notice '📊 Created % tables with proper RLS policies', (
    select count(*) from information_schema.tables 
    where table_schema = 'public' 
    and table_name in (
      'users', 'tickets', 'insights', 'sync_logs', 'ai_responses', 
      'knowledge_base', 'response_templates', 'deflection_metrics', 
      'deflection_settings', 'trials', 'trial_usage', 'subscriptions', 
      'subscription_usage', 'analytics_events', 'performance_metrics', 
      'deflection_queue', 'job_queue'
    )
  );
end $$; 