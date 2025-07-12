import { useAutumn } from "autumn-js/react";
import { USAGE_EVENTS, SUPPORTIQ_PLANS } from "./autumn-config";

// Server-side usage tracking (for API routes)
export async function trackUsage(
  customerId: string,
  event: keyof typeof USAGE_EVENTS,
  quantity: number = 1,
  metadata?: Record<string, any>
) {
  try {
    // This would typically call Autumn's server-side API
    // For now, we'll implement a placeholder that can be replaced
    const response = await fetch('/api/autumn/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        event: USAGE_EVENTS[event],
        quantity,
        metadata,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to track usage: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error tracking usage for ${event}:`, error);
    // Don't throw - usage tracking should not break the main flow
    return null;
  }
}

// Client-side usage tracking hook
export function useUsageTracking() {
  const autumn = useAutumn();

  const trackClientUsage = async (
    event: keyof typeof USAGE_EVENTS,
    quantity: number = 1,
    metadata?: Record<string, any>
  ) => {
    try {
      if (!autumn.customer) {
        console.warn('No customer found for usage tracking');
        return;
      }

      await autumn.track(USAGE_EVENTS[event], quantity, metadata);
    } catch (error) {
      console.error(`Error tracking client usage for ${event}:`, error);
    }
  };

  return {
    trackClientUsage,
    customer: autumn.customer,
    hasAccess: autumn.hasAccess,
    usage: autumn.usage
  };
}

// Usage limit checking
export async function checkUsageLimit(
  customerId: string,
  feature: string,
  requestedQuantity: number = 1
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  try {
    const response = await fetch('/api/autumn/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        feature,
        requestedQuantity
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to check usage limit: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error checking usage limit for ${feature}:`, error);
    // Default to allowing usage if check fails
    return { allowed: true, remaining: 999, limit: 1000 };
  }
}

// Helper functions for SupportIQ specific tracking
export const supportIQTracking = {
  // Track when a support ticket is processed
  ticketProcessed: (customerId: string, metadata?: { platform?: string; category?: string }) =>
    trackUsage(customerId, 'SUPPORT_TICKET_PROCESSED', 1, metadata),

  // Track when AI auto-resolves a ticket
  aiResolution: (customerId: string, metadata?: { confidence?: number; category?: string }) =>
    trackUsage(customerId, 'AI_RESOLUTION', 1, metadata),

  // Track when a ticket is escalated to human expert
  expertEscalation: (customerId: string, metadata?: { reason?: string; category?: string }) =>
    trackUsage(customerId, 'EXPERT_ESCALATION', 1, metadata),

  // Track integration usage
  integrationUsed: (customerId: string, metadata?: { integration?: string; action?: string }) =>
    trackUsage(customerId, 'INTEGRATION_USED', 1, metadata),

  // Track insight generation
  insightGenerated: (customerId: string, metadata?: { type?: string; insights_count?: number }) =>
    trackUsage(customerId, 'INSIGHT_GENERATED', 1, metadata),
};