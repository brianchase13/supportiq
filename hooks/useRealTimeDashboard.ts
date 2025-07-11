'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardMetrics, DashboardError } from '@/lib/dashboard/dashboard-data';
import { createClient } from '@supabase/supabase-js';

interface UseRealTimeDashboardReturn {
  metrics: DashboardMetrics | null;
  error: DashboardError | null;
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  isConnected: boolean;
}

export function useRealTimeDashboard(userId: string): UseRealTimeDashboardReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<DashboardError | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const fetchMetrics = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);

      const url = new URL('/api/dashboard/metrics', window.location.origin);
      if (forceRefresh) url.searchParams.set('refresh', 'true');

      const response = await fetch(url.toString());
      const result = await response.json();

      if (!response.ok) {
        throw {
          message: result.error || 'Failed to fetch metrics',
          code: result.code || 'FETCH_ERROR',
          retryAfter: result.retryAfter
        };
      }

      setMetrics(result.data);
      setError(result.error || null);
      setIsConnected(true);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err as DashboardError);
      setIsConnected(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(() => fetchMetrics(true), [fetchMetrics]);

  useEffect(() => {
    fetchMetrics();

    // Set up real-time subscription
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel(`dashboard_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          console.log('Real-time ticket update:', payload);
          
          // Debounce rapid updates
          setTimeout(() => {
            fetchMetrics(false);
          }, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sync_logs',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          console.log('Real-time sync update:', payload);
          
          // Refresh on successful sync completion
          if (payload.new && (payload.new as any).status === 'success') {
            setTimeout(() => {
              fetchMetrics(false);
            }, 2000);
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Set up periodic refresh as fallback
    const refreshInterval = setInterval(() => {
      if (!document.hidden) { // Only refresh when tab is active
        fetchMetrics(false);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(refreshInterval);
      supabase.removeChannel(channel);
    };
  }, [userId, fetchMetrics]);

  return {
    metrics,
    error,
    loading,
    refreshing,
    refresh,
    isConnected
  };
}