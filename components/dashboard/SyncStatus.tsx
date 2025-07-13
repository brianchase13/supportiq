'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/loading-spinner';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Activity,
  Play,
  Pause,
  Settings
} from 'lucide-react';

interface SyncStatus {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  processed: number;
  total: number;
  errors: number;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
}

interface SyncStatusProps {
  userId: string;
  onSyncStart?: () => void;
  onSyncStop?: () => void;
  className?: string;
}

export function SyncStatus({ userId, onSyncStart, onSyncStop, className = '' }: SyncStatusProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/intercom/sync/status');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  // Start sync
  const startSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/intercom/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          full_sync: false, 
          limit: 100,
          batch_size: 50 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSyncStatus({
          id: data.sync_id,
          status: 'running',
          progress: 0,
          processed: 0,
          total: data.total || 0,
          errors: 0,
          startTime: new Date().toISOString()
        });
        onSyncStart?.();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start sync');
      }
    } catch (error) {
      console.error('Failed to start sync:', error);
      setSyncStatus(prev => prev ? {
        ...prev,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      } : null);
    } finally {
      setLoading(false);
    }
  };

  // Stop sync
  const stopSync = async () => {
    if (!syncStatus?.id) return;

    try {
      await fetch(`/api/intercom/sync/${syncStatus.id}/stop`, { method: 'POST' });
      setSyncStatus(prev => prev ? { ...prev, status: 'paused' } : null);
      onSyncStop?.();
    } catch (error) {
      console.error('Failed to stop sync:', error);
    }
  };

  // Auto-refresh sync status
  useEffect(() => {
    fetchSyncStatus();

    if (autoRefresh) {
      const interval = setInterval(() => {
        if (syncStatus?.status === 'running') {
          fetchSyncStatus();
        }
      }, 2000); // Poll every 2 seconds when running

      return () => clearInterval(interval);
    }
  }, [autoRefresh, syncStatus?.status]);

  const getStatusIcon = () => {
    switch (syncStatus?.status) {
      case 'running':
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (syncStatus?.status) {
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (syncStatus?.status) {
      case 'running':
        return 'Syncing...';
      case 'completed':
        return 'Sync Complete';
      case 'failed':
        return 'Sync Failed';
      case 'paused':
        return 'Sync Paused';
      default:
        return 'Ready to Sync';
    }
  };

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return '';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Sync Status</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'text-blue-600' : 'text-gray-400'}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <CardDescription>
          Real-time status of your Intercom data synchronization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {syncStatus && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(syncStatus.progress)}%</span>
            </div>
            <ProgressBar 
              progress={syncStatus.progress} 
              variant={syncStatus.status === 'failed' ? 'error' : 'default'}
            />
          </div>
        )}

        {/* Sync Statistics */}
        {syncStatus && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {syncStatus.processed}
              </div>
              <div className="text-xs text-gray-600">Processed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {syncStatus.total}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {syncStatus.errors}
              </div>
              <div className="text-xs text-gray-600">Errors</div>
            </div>
          </div>
        )}

        {/* Duration */}
        {syncStatus?.startTime && (
          <div className="text-sm text-gray-600">
            Duration: {formatDuration(syncStatus.startTime, syncStatus.endTime)}
          </div>
        )}

        {/* Error Message */}
        {syncStatus?.errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{syncStatus.errorMessage}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {syncStatus?.status === 'running' ? (
            <Button
              onClick={stopSync}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Stop Sync
            </Button>
          ) : (
            <Button
              onClick={startSync}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {loading ? 'Starting...' : 'Start Sync'}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/settings'}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        {/* Last Sync Info */}
        {syncStatus?.endTime && (
          <div className="text-xs text-gray-500 border-t pt-2">
            Last sync: {new Date(syncStatus.endTime).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 