import { log } from '@/lib/logging/logger';
import { getConfig } from '@/lib/config/constants';
import { supabaseAdmin } from '@/lib/supabase/client';

// Comprehensive monitoring system - KNOW WHEN THINGS BREAK

export interface MonitoringMetrics {
  timestamp: string;
  user_id?: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  tags: Record<string, string>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'error' | 'security' | 'business';
  user_id?: string;
  created_at: string;
  resolved_at?: string;
  status: 'active' | 'resolved' | 'acknowledged';
  metadata: Record<string, unknown>;
}

export class MonitoringSystem {
  private config = getConfig();
  private metricsBuffer: MonitoringMetrics[] = [];
  private alertBuffer: Alert[] = [];
  private isProcessing = false;

  // Record a metric
  async recordMetric(
    metricName: string,
    value: number,
    unit: string,
    tags: Record<string, string> = {},
    severity: MonitoringMetrics['severity'] = 'low',
    userId?: string
  ): Promise<void> {
    const metric: MonitoringMetrics = {
      timestamp: new Date().toISOString(),
      user_id: userId,
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit,
      tags,
      severity,
    };

    this.metricsBuffer.push(metric);

    // Flush buffer if it gets too large
    if (this.metricsBuffer.length >= 100) {
      await this.flushMetrics();
    }

    // Check for alerts
    await this.checkAlerts(metric);
  }

  // Record performance metrics
  async recordPerformanceMetric(
    operation: string,
    durationMs: number,
    userId?: string,
    additionalTags: Record<string, string> = {}
  ): Promise<void> {
    const tags = {
      operation,
      ...additionalTags,
    };

    await this.recordMetric(
      'performance.duration',
      durationMs,
      'milliseconds',
      tags,
      durationMs > this.config.MONITORING.PERFORMANCE_ALERT_THRESHOLD ? 'high' : 'low',
      userId
    );
  }

  // Record error metrics
  async recordErrorMetric(
    errorType: string,
    errorCount: number = 1,
    userId?: string,
    additionalTags: Record<string, string> = {}
  ): Promise<void> {
    const tags = {
      error_type: errorType,
      ...additionalTags,
    };

    await this.recordMetric(
      'errors.count',
      errorCount,
      'count',
      tags,
      errorCount > this.config.MONITORING.ERROR_ALERT_THRESHOLD ? 'critical' : 'medium',
      userId
    );
  }

  // Record business metrics
  async recordBusinessMetric(
    metricName: string,
    value: number,
    userId?: string,
    additionalTags: Record<string, string> = {}
  ): Promise<void> {
    await this.recordMetric(
      `business.${metricName}`,
      value,
      'count',
      additionalTags,
      'low',
      userId
    );
  }

  // Record security events
  async recordSecurityEvent(
    eventType: string,
    severity: MonitoringMetrics['severity'],
    userId?: string,
    additionalTags: Record<string, string> = {}
  ): Promise<void> {
    const tags = {
      event_type: eventType,
      ...additionalTags,
    };

    await this.recordMetric(
      'security.events',
      1,
      'count',
      tags,
      severity,
      userId
    );
  }

  // Check for alerts based on metrics
  private async checkAlerts(metric: MonitoringMetrics): Promise<void> {
    const alerts: Alert[] = [];

    // Performance alerts
    if (metric.metric_name === 'performance.duration' && 
        metric.metric_value > this.config.MONITORING.PERFORMANCE_ALERT_THRESHOLD) {
      alerts.push({
        id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'High Response Time Detected',
        message: `Operation ${metric.tags.operation} took ${metric.metric_value}ms, exceeding threshold of ${this.config.MONITORING.PERFORMANCE_ALERT_THRESHOLD}ms`,
        severity: 'high',
        category: 'performance',
        user_id: metric.user_id,
        created_at: new Date().toISOString(),
        status: 'active',
        metadata: metric as unknown as Record<string, unknown>,
      });
    }

    // Error rate alerts
    if (metric.metric_name === 'errors.count' && 
        metric.metric_value > this.config.MONITORING.ERROR_ALERT_THRESHOLD) {
      alerts.push({
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'High Error Rate Detected',
        message: `${metric.metric_value} errors of type ${metric.tags.error_type} detected, exceeding threshold of ${this.config.MONITORING.ERROR_ALERT_THRESHOLD}`,
        severity: 'critical',
        category: 'error',
        user_id: metric.user_id,
        created_at: new Date().toISOString(),
        status: 'active',
        metadata: metric as unknown as Record<string, unknown>,
      });
    }

    // Crisis mode alerts
    if (metric.metric_name === 'business.tickets_per_hour' && 
        metric.metric_value > this.config.MONITORING.CRISIS_TICKET_THRESHOLD) {
      alerts.push({
        id: `crisis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'Crisis Mode: High Ticket Volume',
        message: `${metric.metric_value} tickets per hour detected, exceeding crisis threshold of ${this.config.MONITORING.CRISIS_TICKET_THRESHOLD}`,
        severity: 'critical',
        category: 'business',
        user_id: metric.user_id,
        created_at: new Date().toISOString(),
        status: 'active',
        metadata: metric as unknown as Record<string, unknown>,
      });
    }

    // Security alerts
    if (metric.metric_name === 'security.events' && 
        (metric.severity === 'high' || metric.severity === 'critical')) {
      alerts.push({
        id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'Security Alert',
        message: `Security event detected: ${metric.tags.event_type}`,
        severity: metric.severity,
        category: 'security',
        user_id: metric.user_id,
        created_at: new Date().toISOString(),
        status: 'active',
        metadata: metric as unknown as Record<string, unknown>,
      });
    }

    // Add alerts to buffer
    this.alertBuffer.push(...alerts);

    // Flush alerts if buffer gets large
    if (this.alertBuffer.length >= 50) {
      await this.flushAlerts();
    }
  }

  // Flush metrics to database
  private async flushMetrics(): Promise<void> {
    if (this.isProcessing || this.metricsBuffer.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const metricsToFlush = [...this.metricsBuffer];
      this.metricsBuffer = [];

      // Batch insert metrics
      const { error } = await supabaseAdmin
        .from('monitoring_metrics')
        .insert(metricsToFlush);

      if (error) {
        log.error('Failed to flush metrics', error);
        // Re-add metrics to buffer on failure
        this.metricsBuffer.unshift(...metricsToFlush);
      } else {
        log.info(`Flushed ${metricsToFlush.length} metrics to database`);
      }
    } catch (error) {
      log.error('Error flushing metrics', error as Error);
      // Re-add metrics to buffer on failure
      this.metricsBuffer.unshift(...this.metricsBuffer);
    } finally {
      this.isProcessing = false;
    }
  }

  // Flush alerts to database
  private async flushAlerts(): Promise<void> {
    if (this.alertBuffer.length === 0) {
      return;
    }

    try {
      const alertsToFlush = [...this.alertBuffer];
      this.alertBuffer = [];

      // Batch insert alerts
      const { error } = await supabaseAdmin
        .from('alerts')
        .insert(alertsToFlush);

      if (error) {
        log.error('Failed to flush alerts', error);
        // Re-add alerts to buffer on failure
        this.alertBuffer.unshift(...alertsToFlush);
      } else {
        log.info(`Flushed ${alertsToFlush.length} alerts to database`);
        
        // Send notifications for critical alerts
        const criticalAlerts = alertsToFlush.filter(alert => alert.severity === 'critical');
        for (const alert of criticalAlerts) {
          await this.sendAlertNotification(alert);
        }
      }
    } catch (error) {
      log.error('Error flushing alerts', error as Error);
      // Re-add alerts to buffer on failure
      this.alertBuffer.unshift(...this.alertBuffer);
    }
  }

  // Send alert notifications
  private async sendAlertNotification(alert: Alert): Promise<void> {
    try {
      // Send email notification
      if (alert.user_id) {
        await this.sendEmailAlert(alert);
      }

      // Send Slack notification
      await this.sendSlackAlert(alert);

      // Send webhook notification
      await this.sendWebhookAlert(alert);

      log.info(`Alert notification sent: ${alert.title}`, {
        alert_id: alert.id,
        severity: alert.severity,
        category: alert.category,
      });
    } catch (error) {
      log.error('Failed to send alert notification', error as Error, {
        alert_id: alert.id,
      });
    }
  }

  // Send email alert
  private async sendEmailAlert(alert: Alert): Promise<void> {
    // This would integrate with your email service
    log.info('Email alert would be sent', {
      alert_id: alert.id,
      user_id: alert.user_id,
      title: alert.title,
    });
  }

  // Send Slack alert
  private async sendSlackAlert(alert: Alert): Promise<void> {
    // This would integrate with Slack webhook
    log.info('Slack alert would be sent', {
      alert_id: alert.id,
      title: alert.title,
      severity: alert.severity,
    });
  }

  // Send webhook alert
  private async sendWebhookAlert(alert: Alert): Promise<void> {
    // This would send to external monitoring services
    log.info('Webhook alert would be sent', {
      alert_id: alert.id,
      title: alert.title,
    });
  }

  // Get current system health
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    metrics: Record<string, number>;
    alerts: Alert[];
    lastUpdated: string;
  }> {
    try {
      // Get recent metrics
      const { data: recentMetrics } = await supabaseAdmin
        .from('monitoring_metrics')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 3600000).toISOString()) // Last hour
        .order('timestamp', { ascending: false });

      // Get active alerts
      const { data: activeAlerts } = await supabaseAdmin
        .from('alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Calculate system status
      const criticalAlerts = activeAlerts?.filter(alert => alert.severity === 'critical') || [];
      const highAlerts = activeAlerts?.filter(alert => alert.severity === 'high') || [];

      let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (criticalAlerts.length > 0) {
        status = 'critical';
      } else if (highAlerts.length > 0) {
        status = 'degraded';
      }

      // Calculate key metrics
      const metrics: Record<string, number> = {
        total_alerts: activeAlerts?.length || 0,
        critical_alerts: criticalAlerts.length,
        high_alerts: highAlerts.length,
        avg_response_time: 0,
        error_rate: 0,
      };

      if (recentMetrics) {
        const performanceMetrics = recentMetrics.filter(m => m.metric_name === 'performance.duration');
        const errorMetrics = recentMetrics.filter(m => m.metric_name === 'errors.count');

        if (performanceMetrics.length > 0) {
          metrics.avg_response_time = performanceMetrics.reduce((sum, m) => sum + m.metric_value, 0) / performanceMetrics.length;
        }

        if (errorMetrics.length > 0) {
          metrics.error_rate = errorMetrics.reduce((sum, m) => sum + m.metric_value, 0);
        }
      }

      return {
        status,
        metrics,
        alerts: activeAlerts || [],
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      log.error('Failed to get system health', error as Error);
      throw error;
    }
  }

  // Get metrics for a specific time range
  async getMetrics(
    startDate: string,
    endDate: string,
    metricNames?: string[],
    userId?: string
  ): Promise<MonitoringMetrics[]> {
    try {
      let query = supabaseAdmin
        .from('monitoring_metrics')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: true });

      if (metricNames && metricNames.length > 0) {
        query = query.in('metric_name', metricNames);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      log.error('Failed to get metrics', error as Error);
      throw error;
    }
  }

  // Resolve an alert
  async resolveAlert(alertId: string, resolutionNote?: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          metadata: { resolutionNote },
        })
        .eq('id', alertId);

      if (error) {
        throw error;
      }

      log.info(`Alert resolved: ${alertId}`, { resolutionNote });
    } catch (error) {
      log.error('Failed to resolve alert', error as Error, { alert_id: alertId });
      throw error;
    }
  }

  // Force flush all buffered data
  async forceFlush(): Promise<void> {
    await this.flushMetrics();
    await this.flushAlerts();
  }

  // Start periodic flushing
  startPeriodicFlush(intervalMs: number = 30000): void {
    setInterval(() => {
      this.flushMetrics();
      this.flushAlerts();
    }, intervalMs);
  }
}

// Export singleton instance
export const monitoringSystem = new MonitoringSystem();

// Start periodic flushing
monitoringSystem.startPeriodicFlush(); 