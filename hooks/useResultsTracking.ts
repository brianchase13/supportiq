'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/lib/auth/user-context';

interface TrackingMetrics {
  totalTickets?: number;
  deflectedTickets?: number;
  avgResponseTimeBefore?: number;
  avgResponseTimeAfter?: number;
  costPerTicket?: number;
  satisfactionBefore?: number;
  satisfactionAfter?: number;
  timeToFirstValue?: number;
  [key: string]: any;
}

interface TrackingOptions {
  eventType?: 'ticket_deflected' | 'satisfaction_improved' | 'cost_savings_achieved' | 'first_value_achieved';
  immediate?: boolean; // Track immediately vs batch
}

export function useResultsTracking() {
  const { user } = useUser();
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track customer results
  const trackResults = useCallback(async (
    metrics: TrackingMetrics, 
    options: TrackingOptions = {}
  ) => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    setTracking(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/track-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          metrics,
          eventType: options.eventType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to track results');
      }

      const result = await response.json();
      return result.success;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error tracking results:', errorMessage);
      return false;
    } finally {
      setTracking(false);
    }
  }, [user?.id]);

  // Track a ticket deflection
  const trackDeflection = useCallback(async (ticketData: {
    ticketId?: string;
    wasDeflected: boolean;
    confidenceScore?: number;
    deflectionReason?: string;
    customerSatisfied?: boolean;
  }) => {
    if (!user?.id) return false;

    return trackResults({
      deflectedTickets: ticketData.wasDeflected ? 1 : 0,
      totalTickets: 1,
      ticketId: ticketData.ticketId,
      confidenceScore: ticketData.confidenceScore,
      deflectionReason: ticketData.deflectionReason,
      customerSatisfied: ticketData.customerSatisfied
    }, {
      eventType: 'ticket_deflected'
    });
  }, [trackResults, user?.id]);

  // Track satisfaction improvement
  const trackSatisfactionImprovement = useCallback(async (satisfactionData: {
    oldScore: number;
    newScore: number;
    feedbackText?: string;
  }) => {
    if (!user?.id) return false;

    return trackResults({
      satisfactionBefore: satisfactionData.oldScore,
      satisfactionAfter: satisfactionData.newScore,
      oldScore: satisfactionData.oldScore,
      newScore: satisfactionData.newScore,
      feedbackText: satisfactionData.feedbackText
    }, {
      eventType: 'satisfaction_improved'
    });
  }, [trackResults, user?.id]);

  // Track cost savings milestone
  const trackCostSavings = useCallback(async (savingsData: {
    milestoneAmount: number;
    totalSavings: number;
    timeframeDays?: number;
    costPerTicket?: number;
  }) => {
    if (!user?.id) return false;

    return trackResults({
      milestoneAmount: savingsData.milestoneAmount,
      totalSavings: savingsData.totalSavings,
      timeframeDays: savingsData.timeframeDays,
      costPerTicket: savingsData.costPerTicket,
      monthlySavings: savingsData.milestoneAmount
    }, {
      eventType: 'cost_savings_achieved'
    });
  }, [trackResults, user?.id]);

  // Track first value achievement
  const trackFirstValue = useCallback(async (valueData: {
    daysToValue: number;
    valueType?: string;
    valueMetric?: string;
    valueThreshold?: number;
  }) => {
    if (!user?.id) return false;

    return trackResults({
      timeToFirstValue: valueData.daysToValue,
      daysToValue: valueData.daysToValue,
      valueType: valueData.valueType,
      valueMetric: valueData.valueMetric,
      valueThreshold: valueData.valueThreshold
    }, {
      eventType: 'first_value_achieved'
    });
  }, [trackResults, user?.id]);

  // Update customer feedback
  const updateFeedback = useCallback(async (feedback: {
    rating?: number;
    quote?: string;
    isTestimonial?: boolean;
    caseStudyConsent?: boolean;
  }) => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    setTracking(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/track-results', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          feedback
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update feedback');
      }

      const result = await response.json();
      return result.success;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error updating feedback:', errorMessage);
      return false;
    } finally {
      setTracking(false);
    }
  }, [user?.id]);

  // Convenience method to track common workflow
  const trackSupportTicket = useCallback(async (ticketData: {
    wasDeflected: boolean;
    responseTime?: number;
    customerSatisfaction?: number;
    costSaved?: number;
  }) => {
    if (!user?.id) return false;

    const metrics: TrackingMetrics = {
      totalTickets: 1,
      deflectedTickets: ticketData.wasDeflected ? 1 : 0
    };

    if (ticketData.responseTime) {
      metrics.avgResponseTimeAfter = ticketData.responseTime;
    }

    if (ticketData.customerSatisfaction) {
      metrics.satisfactionAfter = ticketData.customerSatisfaction;
    }

    if (ticketData.costSaved) {
      metrics.monthlySavings = ticketData.costSaved;
    }

    return trackResults(metrics);
  }, [trackResults, user?.id]);

  return {
    // Core tracking
    trackResults,
    tracking,
    error,
    
    // Specific event tracking
    trackDeflection,
    trackSatisfactionImprovement,
    trackCostSavings,
    trackFirstValue,
    updateFeedback,
    
    // Convenience methods
    trackSupportTicket,
    
    // State
    isTracking: tracking,
    trackingError: error,
    canTrack: !!user?.id
  };
}

// Example usage:
/*
import { useResultsTracking } from '@/hooks/useResultsTracking';

function SupportTicketHandler() {
  const { trackDeflection, trackSatisfactionImprovement, trackSupportTicket } = useResultsTracking();
  
  const handleTicketProcessed = async (ticket) => {
    // Track individual deflection
    await trackDeflection({
      ticketId: ticket.id,
      wasDeflected: ticket.deflected,
      confidenceScore: 0.89,
      customerSatisfied: true
    });
    
    // Or track complete ticket workflow
    await trackSupportTicket({
      wasDeflected: ticket.deflected,
      responseTime: 2.3,
      customerSatisfaction: 4.5,
      costSaved: 15
    });
  };
  
  const handleFeedbackReceived = async (feedback) => {
    await trackSatisfactionImprovement({
      oldScore: 3.2,
      newScore: 4.5,
      feedbackText: feedback.text
    });
  };
  
  return (
    // Your component JSX
  );
}
*/