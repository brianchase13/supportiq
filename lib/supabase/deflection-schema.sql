-- Ticket Deflection System Schema
-- Run this in your Supabase SQL editor to add deflection tables

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

-- Function to update updated_at timestamp (if not exists)
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

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
create trigger update_knowledge_base_updated_at before update on knowledge_base
  for each row execute function update_updated_at_column();

create trigger update_response_templates_updated_at before update on response_templates
  for each row execute function update_updated_at_column();

create trigger update_deflection_settings_updated_at before update on deflection_settings
  for each row execute function update_updated_at_column();