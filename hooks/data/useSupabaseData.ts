'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Ticket, Insight, User } from '@/lib/supabase/types';

export function useTickets(userId: string) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTickets(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userId]);

  return { tickets, loading, error };
}

export function useInsights(userId: string) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchInsights = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('insights')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInsights(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [userId]);

  return { insights, loading, error };
}

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
}

export function useTicketStats(tickets: Ticket[]) {
  return {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    avgResponseTime: Math.round(
      tickets
        .filter(t => t.response_time_minutes)
        .reduce((sum, t) => sum + (t.response_time_minutes || 0), 0) /
      tickets.filter(t => t.response_time_minutes).length || 0
    ),
    satisfactionScore: Number((
      tickets
        .filter(t => t.satisfaction_score)
        .reduce((sum, t) => sum + (t.satisfaction_score || 0), 0) /
      tickets.filter(t => t.satisfaction_score).length || 0
    ).toFixed(1)),
    categoryBreakdown: tickets.reduce((acc, ticket) => {
      if (ticket.category) {
        acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    sentimentBreakdown: tickets.reduce((acc, ticket) => {
      if (ticket.sentiment) {
        acc[ticket.sentiment] = (acc[ticket.sentiment] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
  };
}

export async function syncIntercomData(userId: string) {
  try {
    const response = await fetch('/api/intercom/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function analyzeTickets(userId: string, ticketIds?: string[]) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, ticketIds }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function generateInsights(userId: string) {
  try {
    const response = await fetch('/api/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Insight generation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}