-- Job Queue System for Ticket Deflection
-- Run this in your Supabase SQL editor to add queue tables

-- Deflection jobs queue for background processing
create table if not exists deflection_jobs (
  id text primary key,
  user_id uuid references users(id) on delete cascade,
  ticket_data jsonb not null, -- The ticket data to process
  webhook_event jsonb, -- Optional webhook event data
  priority text not null check (priority in ('high', 'normal', 'low')) default 'normal',
  max_retries integer not null default 3,
  retry_count integer not null default 0,
  status text not null check (status in ('pending', 'processing', 'completed', 'failed', 'retrying')) default 'pending',
  scheduled_at timestamp with time zone not null default now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  error_message text,
  result jsonb, -- Processing result data
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS on deflection_jobs table
alter table deflection_jobs enable row level security;

-- Create policy for deflection_jobs (admin access for system operations)
create policy "System can manage deflection jobs" on deflection_jobs
  for all using (auth.role() = 'service_role');

-- Create policy for users to view their own jobs
create policy "Users can view their own deflection jobs" on deflection_jobs
  for select using (auth.uid() = user_id);

-- System errors log for monitoring
create table if not exists system_errors (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')) default 'medium',
  message text not null,
  metadata jsonb,
  resolved boolean not null default false,
  resolved_at timestamp with time zone,
  resolved_by uuid references users(id),
  created_at timestamp with time zone not null default now()
);

-- Enable RLS on system_errors table
alter table system_errors enable row level security;

-- Create policy for system_errors (admin access only)
create policy "System can manage errors" on system_errors
  for all using (auth.role() = 'service_role');

-- Indexes for performance
create index if not exists idx_deflection_jobs_status on deflection_jobs(status);
create index if not exists idx_deflection_jobs_user_id on deflection_jobs(user_id);
create index if not exists idx_deflection_jobs_priority on deflection_jobs(priority desc);
create index if not exists idx_deflection_jobs_scheduled_at on deflection_jobs(scheduled_at);
create index if not exists idx_deflection_jobs_created_at on deflection_jobs(created_at desc);

create index if not exists idx_system_errors_type on system_errors(type);
create index if not exists idx_system_errors_severity on system_errors(severity);
create index if not exists idx_system_errors_created_at on system_errors(created_at desc);
create index if not exists idx_system_errors_resolved on system_errors(resolved);

-- Function to automatically update updated_at
create or replace function update_deflection_jobs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at on deflection_jobs
create trigger update_deflection_jobs_updated_at_trigger
  before update on deflection_jobs
  for each row execute function update_deflection_jobs_updated_at();

-- Function to cleanup old jobs (can be called via cron)
create or replace function cleanup_old_deflection_jobs(days_old integer default 7)
returns integer as $$
declare
  deleted_count integer;
begin
  delete from deflection_jobs 
  where created_at < now() - interval '1 day' * days_old;
  
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$ language plpgsql security definer;

-- Function to get queue statistics
create or replace function get_deflection_queue_stats(hours_back integer default 24)
returns json as $$
declare
  stats json;
begin
  select json_build_object(
    'pending', count(*) filter (where status = 'pending'),
    'processing', count(*) filter (where status = 'processing'),
    'completed', count(*) filter (where status = 'completed'),
    'failed', count(*) filter (where status = 'failed'),
    'retrying', count(*) filter (where status = 'retrying'),
    'total', count(*),
    'avg_processing_time_ms', avg(
      case when status = 'completed' and started_at is not null and completed_at is not null 
      then extract(epoch from (completed_at - started_at)) * 1000 
      else null end
    )
  )
  into stats
  from deflection_jobs
  where created_at > now() - interval '1 hour' * hours_back;
  
  return stats;
end;
$$ language plpgsql security definer;

-- Create a view for monitoring active jobs
create or replace view active_deflection_jobs as
select 
  id,
  user_id,
  priority,
  status,
  retry_count,
  max_retries,
  scheduled_at,
  started_at,
  extract(epoch from (now() - started_at)) as processing_duration_seconds,
  error_message,
  created_at
from deflection_jobs
where status in ('pending', 'processing', 'retrying')
order by priority desc, created_at asc;