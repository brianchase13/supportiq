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

-- Triggers to automatically update updated_at
create trigger update_users_updated_at before update on users
  for each row execute function update_updated_at_column();

create trigger update_insights_updated_at before update on insights
  for each row execute function update_updated_at_column();