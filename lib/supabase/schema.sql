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

-- Indexes for better performance
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

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

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

-- Deflection settings per user
create table if not exists deflection_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  auto_response_enabled boolean default true,
  confidence_threshold decimal(3,2) default 0.75 check (confidence_threshold >= 0.0 and confidence_threshold <= 1.0),
  escalation_threshold decimal(3,2) default 0.50 check (escalation_threshold >= 0.0 and escalation_threshold <= 1.0),
  response_language text default 'en',
  business_hours_only boolean default false,
  excluded_categories text[],
  escalation_keywords text[],
  custom_instructions text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on deflection_settings table
alter table deflection_settings enable row level security;

-- Create policy for deflection_settings
create policy "Users can only see their own deflection settings" on deflection_settings
  for all using (auth.uid() = user_id);

-- Additional indexes for deflection tables
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

-- Triggers to automatically update updated_at
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