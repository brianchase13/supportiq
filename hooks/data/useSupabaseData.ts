'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Ticket, Insight, User } from '@/lib/supabase/types';
import { useAuth } from '@/components/auth/AuthContext';

export function useTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('user_id', user.id)
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
  }, [user?.id]);

  return { tickets, loading, error };
}

export function useInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchInsights = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('insights')
          .select('*')
          .eq('user_id', user.id)
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
  }, [user?.id]);

  return { insights, loading, error };
}

export function useUser() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser?.id) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
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
  }, [authUser?.id]);

  return { user, loading, error };
}

export function useTicketStats() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalTickets: 0,
    openTickets: 0,
    avgResponseTime: 0,
    satisfactionScore: 0,
    deflectionRate: 85,
    categoryBreakdown: {} as Record<string, number>,
    sentimentBreakdown: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchTicketStats = async () => {
      try {
        setLoading(true);
        const { data: tickets, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const ticketStats = {
          totalTickets: tickets?.length || 0,
          openTickets: tickets?.filter(t => t.status === 'open').length || 0,
          avgResponseTime: Math.round(
            tickets
              ?.filter(t => t.response_time_minutes)
              .reduce((sum, t) => sum + (t.response_time_minutes || 0), 0) /
            (tickets?.filter(t => t.response_time_minutes).length || 1) || 0
          ),
          satisfactionScore: Number((
            tickets
              ?.filter(t => t.satisfaction_score)
              .reduce((sum, t) => sum + (t.satisfaction_score || 0), 0) /
            (tickets?.filter(t => t.satisfaction_score).length || 1) || 0
          ).toFixed(1)),
          deflectionRate: 85, // Default value, could be calculated from actual data
          categoryBreakdown: tickets?.reduce((acc, ticket) => {
            if (ticket.category) {
              acc[ticket.category] = (acc[ticket.category] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>) || {},
          sentimentBreakdown: tickets?.reduce((acc, ticket) => {
            if (ticket.sentiment) {
              acc[ticket.sentiment] = (acc[ticket.sentiment] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>) || {},
        };

        setMetrics(ticketStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ticket stats');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketStats();
  }, [user?.id]);

  return { metrics, loading, error };
}

export async function syncIntercomData() {
  try {
    const response = await fetch('/api/intercom/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function analyzeTickets(ticketIds?: string[]) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticketIds }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function generateInsights() {
  try {
    const response = await fetch('/api/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Insight generation failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}