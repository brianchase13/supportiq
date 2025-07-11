export interface User {
  id: string;
  email: string;
  intercom_access_token?: string;
  intercom_workspace_id?: string;
  subscription_status: 'trial' | 'active' | 'canceled' | 'expired';
  subscription_plan: 'starter' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  intercom_conversation_id: string;
  content?: string;
  subject?: string;
  category?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentiment_score?: number;
  response_time_minutes?: number;
  satisfaction_score?: number;
  agent_name?: string;
  agent_email?: string;
  customer_email?: string;
  status: 'open' | 'closed' | 'snoozed';
  priority: 'not_priority' | 'priority';
  assignee_type: 'admin' | 'team';
  tags?: string[];
  created_at: string;
  updated_at: string;
  synced_at: string;
}

export interface Insight {
  id: string;
  user_id: string;
  type: 'issue_pattern' | 'performance' | 'prediction' | 'prevention';
  title: string;
  description: string;
  impact_score: number;
  potential_savings?: string;
  action_items?: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimated_effort: string;
  }[];
  data_source?: Record<string, any>;
  status: 'active' | 'dismissed' | 'implemented';
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  user_id: string;
  sync_type: 'tickets' | 'insights';
  status: 'success' | 'error' | 'in_progress';
  records_processed: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

// Intercom API types
export interface IntercomConversation {
  id: string;
  title: string;
  state: 'open' | 'closed' | 'snoozed';
  priority: 'not_priority' | 'priority';
  assignee?: {
    id: string;
    name: string;
    email: string;
    type: 'admin' | 'team';
  };
  contacts?: {
    contacts: Array<{
      id: string;
      email: string;
      name?: string;
    }>;
  };
  conversation_parts?: {
    conversation_parts: Array<{
      id: string;
      part_type: 'comment' | 'note';
      body: string;
      created_at: number;
      author?: {
        id: string;
        name: string;
        email: string;
        type: 'admin' | 'user';
      };
    }>;
  };
  tags?: {
    tags: Array<{
      id: string;
      name: string;
    }>;
  };
  statistics?: {
    first_contact_reply?: {
      created_at: number;
    };
    first_admin_reply?: {
      created_at: number;
    };
    last_assignment_at?: number;
    last_assignment_admin_reply_at?: number;
    last_contact_reply_at?: number;
    last_admin_reply_at?: number;
    last_close_at?: number;
    count_reopens?: number;
    count_assignments?: number;
    count_conversation_parts?: number;
  };
  created_at: number;
  updated_at: number;
}

export interface IntercomAccessToken {
  access_token: string;
  token_type: 'Bearer';
  expires_in?: number;
  refresh_token?: string;
}