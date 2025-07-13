// Comprehensive TypeScript interfaces - NO MORE 'any' TYPES

// User Types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  role?: string;
  subscription_status: 'trial' | 'active' | 'cancelled' | 'expired';
  subscription_plan: 'starter' | 'pro' | 'enterprise';
  intercom_connected: boolean;
  intercom_workspace_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  company_name?: string;
  industry?: string;
  monthly_tickets?: number;
  team_size?: number;
  support_channels: string[];
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  email_notifications: boolean;
  weekly_reports: boolean;
  auto_analysis: boolean;
  deflection_settings: DeflectionSettings;
  notification_settings: NotificationSettings;
}

// Ticket Types
export interface Ticket {
  id: string;
  user_id: string;
  intercom_conversation_id?: string;
  subject: string;
  content: string;
  category: TicketCategory;
  subcategory?: string;
  priority: TicketPriority;
  sentiment: TicketSentiment;
  sentiment_score: number;
  status: TicketStatus;
  customer_email: string;
  agent_name?: string;
  agent_email?: string;
  response_time_minutes?: number;
  resolution_time_minutes?: number;
  satisfaction_score?: number;
  deflection_potential: DeflectionPotential;
  confidence?: number;
  keywords: string[];
  tags: string[];
  metadata: TicketMetadata;
  created_at: string;
  updated_at: string;
}

export type TicketCategory = 
  | 'Account' 
  | 'Billing' 
  | 'Feature Request' 
  | 'Bug' 
  | 'How-to' 
  | 'Technical Issue' 
  | 'Other';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketSentiment = 'positive' | 'neutral' | 'negative';
export type TicketStatus = 'open' | 'closed' | 'pending' | 'resolved';
export type DeflectionPotential = 'high' | 'medium' | 'low';

export interface TicketMetadata {
  source: 'intercom' | 'zendesk' | 'manual' | 'api';
  original_id?: string;
  assignee_type?: 'admin' | 'bot' | 'human';
  escalation_reason?: string;
  ai_analysis?: AIAnalysisResult;
}

// AI Analysis Types
export interface AIAnalysisResult {
  category: TicketCategory;
  subcategory?: string;
  priority: TicketPriority;
  sentiment: TicketSentiment;
  sentiment_score: number;
  deflection_potential: DeflectionPotential;
  confidence: number;
  keywords: string[];
  intent: string;
  estimated_resolution_time: number; // minutes
  requires_human: boolean;
  tags: string[];
  similar_tickets?: string[];
  suggested_response?: string;
  model_used: string;
  tokens_used: number;
  cost_usd: number;
  analysis_timestamp: string;
}

export interface DeflectionResponse {
  can_deflect: boolean;
  response_content: string;
  confidence: number;
  response_type: 'auto_resolve' | 'follow_up' | 'escalate';
  reasoning: string;
  suggested_actions: string[];
  follow_up_required: boolean;
  escalation_triggers: string[];
  estimated_cost: number;
  tokens_used: number;
  model_used: string;
  generated_at: string;
}

// Deflection Settings
export interface DeflectionSettings {
  auto_response_enabled: boolean;
  confidence_threshold: number;
  escalation_threshold: number;
  working_hours: WorkingHours;
  response_language: string;
  custom_instructions?: string;
  excluded_categories: TicketCategory[];
  excluded_keywords: string[];
}

export interface WorkingHours {
  enabled: boolean;
  timezone: string;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  days_of_week: number[]; // 0-6, Sunday = 0
}

// Notification Types
export interface NotificationSettings {
  email: EmailNotificationSettings;
  slack: SlackNotificationSettings;
  webhook: WebhookNotificationSettings;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  crisis_alerts: boolean;
  weekly_reports: boolean;
  deflection_summaries: boolean;
  roi_updates: boolean;
}

export interface SlackNotificationSettings {
  enabled: boolean;
  webhook_url?: string;
  channel?: string;
  crisis_alerts: boolean;
  daily_summaries: boolean;
}

export interface WebhookNotificationSettings {
  enabled: boolean;
  url?: string;
  events: string[];
}

// Analytics Types
export interface AnalyticsMetrics {
  total_tickets: number;
  deflected_tickets: number;
  deflection_rate: number;
  avg_response_time: number;
  avg_resolution_time: number;
  customer_satisfaction: number;
  agent_efficiency: number;
  cost_savings: number;
  roi_percentage: number;
  top_categories: CategoryBreakdown[];
  top_issues: IssueBreakdown[];
  sentiment_breakdown: SentimentBreakdown[];
  trends: TrendData;
}

export interface CategoryBreakdown {
  category: TicketCategory;
  count: number;
  percentage: number;
  avg_resolution_time: number;
  deflection_rate: number;
}

export interface IssueBreakdown {
  issue: string;
  count: number;
  percentage: number;
  keywords: string[];
  deflection_potential: DeflectionPotential;
}

export interface SentimentBreakdown {
  sentiment: TicketSentiment;
  count: number;
  percentage: number;
  avg_satisfaction: number;
}

export interface TrendData {
  daily_tickets: DailyTicketData[];
  deflection_rate_trend: TrendPoint[];
  satisfaction_trend: TrendPoint[];
  response_time_trend: TrendPoint[];
}

export interface DailyTicketData {
  date: string;
  total_tickets: number;
  deflected_tickets: number;
  avg_response_time: number;
  satisfaction_score: number;
}

export interface TrendPoint {
  date: string;
  value: number;
  change_percentage?: number;
}

// ROI Types
export interface ROICalculation {
  current_costs: CostBreakdown;
  potential_savings: SavingsBreakdown;
  roi_metrics: ROIMetrics;
  recommendations: Recommendation[];
  confidence_score: number;
  calculated_at: string;
}

export interface CostBreakdown {
  monthly_tickets: number;
  avg_handle_time: number; // minutes
  agent_hourly_cost: number;
  monthly_agent_cost: number;
  annual_agent_cost: number;
  other_costs: number;
}

export interface SavingsBreakdown {
  deflection_rate: number;
  auto_resolved_tickets: number;
  human_tickets: number;
  new_monthly_cost: number;
  new_annual_cost: number;
  monthly_savings: number;
  annual_savings: number;
  time_saved_hours: number;
}

export interface ROIMetrics {
  roi_percentage: number;
  payback_period_months: number;
  monthly_savings: number;
  annual_savings: number;
  cost_per_ticket_reduction: number;
}

export interface Recommendation {
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  estimated_savings: number;
  implementation_time: string;
  confidence: number;
}

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
  message?: string;
  timestamp: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Webhook Types
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: WebhookEventData;
  timestamp: string;
  signature?: string;
}

export type WebhookEventType = 
  | 'ticket.created'
  | 'ticket.updated'
  | 'ticket.closed'
  | 'conversation.created'
  | 'conversation.replied'
  | 'deflection.completed'
  | 'crisis.detected';

export interface WebhookEventData {
  ticket_id?: string;
  conversation_id?: string;
  user_id: string;
  event_data: Record<string, unknown>;
}

// Rate Limiting Types
export interface RateLimitConfig {
  window_ms: number;
  max_requests: number;
  key_generator: (request: Request) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset_time: string;
  ms_before_next: number;
}

// Logging Types
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: string;
  user_id?: string;
  session_id?: string;
  request_id?: string;
  context?: Record<string, unknown>;
  error?: Error;
}

// Test Types
export interface TestResult {
  test_name: string;
  passed: boolean;
  duration_ms: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  duration_ms: number;
  timestamp: string;
} 