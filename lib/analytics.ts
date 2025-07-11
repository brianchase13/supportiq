// Production analytics system for SupportIQ
// Tracks EVERYTHING for optimization and growth

import { supabaseAdmin } from '@/lib/supabase/client';

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  userId?: string;
  timestamp?: string;
}

export interface UserMetrics {
  timeToFirstInsight: number; // seconds
  timeToFirstConnection: number; // seconds
  insightActionConversionRate: number; // percentage
  featureUsageByPlan: Record<string, number>;
  churnPredictionScore: number; // 0-100
  lifetimeValue: number;
  activationScore: number; // 0-100
}

export class Analytics {
  private static instance: Analytics;
  private postHogClient: any;
  private sentryClient: any;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeClients();
    }
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  private initializeClients() {
    // PostHog for product analytics
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      import('posthog-js').then(({ default: posthog }) => {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
          person_profiles: 'identified_only',
          capture_pageview: false, // We'll handle this manually
          capture_pageleave: true,
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
              posthog.debug();
            }
          }
        });
        this.postHogClient = posthog;
      });
    }

    // Sentry for error tracking
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      import('@sentry/nextjs').then(({ init, setUser }) => {
        init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
          environment: process.env.NODE_ENV,
          integrations: [
            // Add performance monitoring
          ],
        });
        this.sentryClient = { setUser };
      });
    }
  }

  // Track critical business events
  async track(event: AnalyticsEvent) {
    const { name, properties, userId, timestamp } = event;
    const eventData = {
      ...properties,
      timestamp: timestamp || new Date().toISOString(),
      userId,
    };

    // Track in PostHog
    if (this.postHogClient) {
      this.postHogClient.capture(name, eventData);
    }

    // Store in database for analysis
    await this.storeEvent(name, eventData, userId);

    // Update user metrics
    if (userId) {
      await this.updateUserMetrics(userId, name, eventData);
    }
  }

  // Identify user for tracking
  async identify(userId: string, traits: Record<string, any>) {
    if (this.postHogClient) {
      this.postHogClient.identify(userId, traits);
    }

    if (this.sentryClient) {
      this.sentryClient.setUser({ id: userId, ...traits });
    }

    // Store user traits
    await supabaseAdmin
      .from('user_analytics')
      .upsert({
        user_id: userId,
        traits,
        updated_at: new Date().toISOString(),
      });
  }

  // Track page views
  async page(pageName: string, properties: Record<string, any> = {}) {
    if (this.postHogClient) {
      this.postHogClient.capture('$pageview', {
        $current_url: window.location.href,
        page_name: pageName,
        ...properties,
      });
    }

    await this.track({
      name: 'page_viewed',
      properties: {
        page_name: pageName,
        url: typeof window !== 'undefined' ? window.location.href : '',
        ...properties,
      },
    });
  }

  // Business-critical event tracking
  async trackActivation(userId: string, step: string, data: Record<string, any> = {}) {
    await this.track({
      name: 'activation_step',
      properties: {
        step,
        ...data,
      },
      userId,
    });
  }

  async trackConversion(userId: string, type: string, value: number, data: Record<string, any> = {}) {
    await this.track({
      name: 'conversion',
      properties: {
        conversion_type: type,
        value,
        ...data,
      },
      userId,
    });
  }

  async trackFeatureUsage(userId: string, feature: string, planType: string, data: Record<string, any> = {}) {
    await this.track({
      name: 'feature_used',
      properties: {
        feature,
        plan_type: planType,
        ...data,
      },
      userId,
    });
  }

  // Calculate critical success metrics
  async calculateUserMetrics(userId: string): Promise<UserMetrics> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get user events
    const { data: events, error } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', thirtyDaysAgo.toISOString())
      .order('timestamp', { ascending: true });

    if (error || !events) {
      throw new Error('Failed to fetch user events');
    }

    // Calculate metrics
    const metrics: UserMetrics = {
      timeToFirstInsight: this.calculateTimeToFirstInsight(events),
      timeToFirstConnection: this.calculateTimeToFirstConnection(events),
      insightActionConversionRate: this.calculateInsightActionConversion(events),
      featureUsageByPlan: this.calculateFeatureUsageByPlan(events),
      churnPredictionScore: await this.calculateChurnPrediction(userId, events),
      lifetimeValue: await this.calculateLifetimeValue(userId),
      activationScore: this.calculateActivationScore(events),
    };

    return metrics;
  }

  private calculateTimeToFirstInsight(events: any[]): number {
    const signupEvent = events.find(e => e.event_name === 'user_signup');
    const firstInsightEvent = events.find(e => e.event_name === 'first_insight_generated');

    if (!signupEvent || !firstInsightEvent) return 0;

    const signupTime = new Date(signupEvent.timestamp);
    const insightTime = new Date(firstInsightEvent.timestamp);
    
    return Math.round((insightTime.getTime() - signupTime.getTime()) / 1000);
  }

  private calculateTimeToFirstConnection(events: any[]): number {
    const signupEvent = events.find(e => e.event_name === 'user_signup');
    const connectionEvent = events.find(e => e.event_name === 'intercom_connected');

    if (!signupEvent || !connectionEvent) return 0;

    const signupTime = new Date(signupEvent.timestamp);
    const connectionTime = new Date(connectionEvent.timestamp);
    
    return Math.round((connectionTime.getTime() - signupTime.getTime()) / 1000);
  }

  private calculateInsightActionConversion(events: any[]): number {
    const insightEvents = events.filter(e => e.event_name === 'insight_viewed');
    const actionEvents = events.filter(e => e.event_name === 'insight_action_taken');

    if (insightEvents.length === 0) return 0;
    
    return Math.round((actionEvents.length / insightEvents.length) * 100);
  }

  private calculateFeatureUsageByPlan(events: any[]): Record<string, number> {
    const featureUsage: Record<string, number> = {};
    
    events
      .filter(e => e.event_name === 'feature_used')
      .forEach(event => {
        const planType = event.properties?.plan_type || 'free';
        featureUsage[planType] = (featureUsage[planType] || 0) + 1;
      });

    return featureUsage;
  }

  private async calculateChurnPrediction(userId: string, events: any[]): Promise<number> {
    // Simple churn prediction based on activity patterns
    const recentEvents = events.filter(e => {
      const eventTime = new Date(e.timestamp);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return eventTime >= sevenDaysAgo;
    });

    const lastLoginEvent = events.find(e => e.event_name === 'dashboard_accessed');
    const daysSinceLastLogin = lastLoginEvent 
      ? Math.round((Date.now() - new Date(lastLoginEvent.timestamp).getTime()) / (1000 * 60 * 60 * 24))
      : 30;

    // Factors that increase churn risk
    let churnScore = 0;
    
    if (daysSinceLastLogin > 7) churnScore += 30;
    if (daysSinceLastLogin > 14) churnScore += 30;
    if (recentEvents.length < 5) churnScore += 20;
    if (!events.some(e => e.event_name === 'payment_successful')) churnScore += 20;

    return Math.min(100, churnScore);
  }

  private async calculateLifetimeValue(userId: string): Promise<number> {
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error || !payments) return 0;

    return payments.reduce((sum, payment) => sum + (payment.amount || 0), 0) / 100; // Convert from cents
  }

  private calculateActivationScore(events: any[]): number {
    const activationEvents = [
      'intercom_connected',
      'first_sync_completed',
      'first_insight_generated',
      'dashboard_accessed',
      'insight_viewed',
    ];

    const completedEvents = activationEvents.filter(eventName =>
      events.some(e => e.event_name === eventName)
    );

    return Math.round((completedEvents.length / activationEvents.length) * 100);
  }

  private async storeEvent(eventName: string, properties: Record<string, any>, userId?: string) {
    try {
      await supabaseAdmin
        .from('analytics_events')
        .insert({
          event_name: eventName,
          properties,
          user_id: userId,
          timestamp: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  }

  private async updateUserMetrics(userId: string, eventName: string, properties: Record<string, any>) {
    // Update specific metrics based on event type
    const updates: Record<string, any> = {
      last_active_at: new Date().toISOString(),
    };

    switch (eventName) {
      case 'intercom_connected':
        updates.intercom_connected_at = new Date().toISOString();
        break;
      case 'first_insight_generated':
        updates.first_insight_at = new Date().toISOString();
        break;
      case 'payment_successful':
        updates.converted_at = new Date().toISOString();
        break;
    }

    try {
      await supabaseAdmin
        .from('user_metrics')
        .upsert({
          user_id: userId,
          ...updates,
        });
    } catch (error) {
      console.error('Failed to update user metrics:', error);
    }
  }
}

// Critical success metrics tracking
export const trackCriticalMetrics = {
  // Time to first insight < 5 minutes
  async timeToFirstInsight(userId: string) {
    const analytics = Analytics.getInstance();
    await analytics.track({
      name: 'first_insight_generated',
      userId,
      properties: {
        metric: 'time_to_value',
        target: 300, // 5 minutes
      },
    });
  },

  // Activation rate: Intercom connected within 10 min
  async activationRate(userId: string, timeToConnect: number) {
    const analytics = Analytics.getInstance();
    await analytics.track({
      name: 'activation_completed',
      userId,
      properties: {
        time_to_connect: timeToConnect,
        target: 600, // 10 minutes
        achieved: timeToConnect <= 600,
      },
    });
  },

  // Daily active usage > 60%
  async dailyActiveUsage(userId: string) {
    const analytics = Analytics.getInstance();
    await analytics.track({
      name: 'daily_active_session',
      userId,
      properties: {
        session_date: new Date().toISOString().split('T')[0],
      },
    });
  },

  // 30% upgrade within first month
  async upgradeConversion(userId: string, daysToUpgrade: number) {
    const analytics = Analytics.getInstance();
    await analytics.track({
      name: 'upgrade_conversion',
      userId,
      properties: {
        days_to_upgrade: daysToUpgrade,
        target: 30, // 30 days
        achieved: daysToUpgrade <= 30,
      },
    });
  },

  // Track the Gary Tan test: credit card in 5 minutes
  async garyTanTest(userId: string, timeToIntent: number) {
    const analytics = Analytics.getInstance();
    await analytics.track({
      name: 'gary_tan_test',
      userId,
      properties: {
        time_to_purchase_intent: timeToIntent,
        target: 300, // 5 minutes
        achieved: timeToIntent <= 300,
      },
    });
  },
};

// Export singleton instance
export const analytics = Analytics.getInstance();