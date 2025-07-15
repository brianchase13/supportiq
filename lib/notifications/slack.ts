import axios from 'axios';

interface SlackMessage {
  text?: string;
  blocks?: any[];
  attachments?: any[];
}

interface SlackNotification {
  channel?: string;
  username?: string;
  icon_emoji?: string;
  icon_url?: string;
}

interface CrisisAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metrics?: Record<string, any>;
  recommendations?: string[];
}

interface PerformanceUpdate {
  type: 'daily' | 'weekly' | 'monthly';
  metrics: {
    ticketsHandled: number;
    avgResponseTime: number;
    satisfactionScore: number;
    deflectionRate: number;
    savings: number;
  };
  highlights: string[];
}

export class SlackNotifier {
  private webhookUrl: string;
  private defaultChannel: string;

  constructor(webhookUrl: string, defaultChannel: string = '#support-alerts') {
    this.webhookUrl = webhookUrl;
    this.defaultChannel = defaultChannel;
  }

  private async sendMessage(message: SlackMessage, notification: SlackNotification = {}) {
    try {
      const payload = {
        channel: notification.channel || this.defaultChannel,
        username: notification.username || 'SupportIQ Bot',
        icon_emoji: notification.icon_emoji || ':robot_face:',
        icon_url: notification.icon_url,
        ...message
      };

      await axios.post(this.webhookUrl, payload);
      console.log('Slack notification sent successfully');
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      throw error;
    }
  }

  async sendCrisisAlert(alert: CrisisAlert): Promise<void> {
    const severityColors = {
      low: '#36a64f',
      medium: '#ffa500',
      high: '#ff6b35',
      critical: '#ff0000'
    };

    const severityIcons = {
      low: ':information_source:',
      medium: ':warning:',
      high: ':rotating_light:',
      critical: ':fire:'
    };

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${severityIcons[alert.severity]} ${alert.title}`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: alert.description
        }
      }
    ];

    if (alert.metrics) {
      const metricsText = Object.entries(alert.metrics)
        .map(([key, value]) => `• *${key}:* ${value}`)
        .join('\n');

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Current Metrics:*\n${metricsText}`
        }
      });
    }

    if (alert.recommendations && alert.recommendations.length > 0) {
      const recommendationsText = alert.recommendations
        .map(rec => `• ${rec}`)
        .join('\n');

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Recommended Actions:*\n${recommendationsText}`
        }
      });
    }

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Alert generated at ${new Date().toLocaleString()}`
        }
      ]
    } as any);

    await this.sendMessage({
      text: `🚨 Crisis Alert: ${alert.title}`,
      blocks
    }, {
      icon_emoji: severityIcons[alert.severity]
    });
  }

  async sendPerformanceUpdate(update: PerformanceUpdate): Promise<void> {
    const periodEmojis = {
      daily: ':sunny:',
      weekly: ':calendar:',
      monthly: ':chart_with_upwards_trend:'
    };

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${periodEmojis[update.type]} ${update.type.charAt(0).toUpperCase() + update.type.slice(1)} Performance Report`,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Tickets Handled:*\n${update.metrics.ticketsHandled.toLocaleString()}`
          },
          {
            type: 'mrkdwn',
            text: `*Avg Response Time:*\n${update.metrics.avgResponseTime}m`
          },
          {
            type: 'mrkdwn',
            text: `*Satisfaction Score:*\n${update.metrics.satisfactionScore}/5`
          },
          {
            type: 'mrkdwn',
            text: `*Deflection Rate:*\n${update.metrics.deflectionRate}%`
          },
          {
            type: 'mrkdwn',
            text: `*Monthly Savings:*\n$${update.metrics.savings.toLocaleString()}`
          }
        ]
      }
    ];

    if (update.highlights.length > 0) {
      const highlightsText = update.highlights
        .map(highlight => `• ${highlight}`)
        .join('\n');

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Key Highlights:*
${highlightsText}`
        }
      } as any);
    }

    await this.sendMessage({
      text: `${periodEmojis[update.type]} Performance Update: ${update.metrics.ticketsHandled} tickets handled`,
      blocks
    });
  }

  async sendSyncStatus(status: {
    status: 'started' | 'completed' | 'failed';
    recordsProcessed?: number;
    errors?: number;
    duration?: number;
  }): Promise<void> {
    const statusIcons = {
      started: ':hourglass_flowing_sand:',
      completed: ':white_check_mark:',
      failed: ':x:'
    };

    const statusColors = {
      started: '#ffa500',
      completed: '#36a64f',
      failed: '#ff0000'
    };

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${statusIcons[status.status]} Sync ${status.status.charAt(0).toUpperCase() + status.status.slice(1)}`,
          emoji: true
        }
      }
    ];

    if (status.recordsProcessed !== undefined) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Records Processed:* ${status.recordsProcessed.toLocaleString()}`
        }
      } as any);
    }

    if (status.errors !== undefined) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Errors:* ${status.errors}`
        }
      } as any);
    }

    if (status.duration !== undefined) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Duration:* ${Math.round(status.duration / 1000)}s`
        }
      } as any);
    }

    await this.sendMessage({
      text: `${statusIcons[status.status]} Sync ${status.status}: ${status.recordsProcessed || 0} records processed`,
      blocks
    });
  }

  async sendROIUpdate(roiData: {
    monthlySavings: number;
    roi: number;
    ticketsDeflected: number;
    timeSaved: number;
  }): Promise<void> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: ':money_with_wings: ROI Update',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Monthly Savings:*\n$${roiData.monthlySavings.toLocaleString()}`
          },
          {
            type: 'mrkdwn',
            text: `*ROI:*\n${roiData.roi.toFixed(0)}%`
          },
          {
            type: 'mrkdwn',
            text: `*Tickets Deflected:*\n${roiData.ticketsDeflected.toLocaleString()}`
          },
          {
            type: 'mrkdwn',
            text: `*Time Saved:*\n${roiData.timeSaved}h`
          }
        ]
      }
    ];

    await this.sendMessage({
      text: `💰 ROI Update: $${roiData.monthlySavings.toLocaleString()} saved this month`,
      blocks
    }, {
      icon_emoji: ':money_with_wings:'
    });
  }

  async sendCustomMessage(message: string, channel?: string): Promise<void> {
    await this.sendMessage({
      text: message
    }, {
      channel
    });
  }

  async sendRichMessage(blocks: any[], text?: string, channel?: string): Promise<void> {
    await this.sendMessage({
      text,
      blocks
    }, {
      channel
    });
  }
}

// Factory function to create notifier instance
export const createSlackNotifier = (webhookUrl: string, channel?: string): SlackNotifier => {
  return new SlackNotifier(webhookUrl, channel);
};

// Default notifier for common use cases
export const defaultSlackNotifier = new SlackNotifier(
  process.env.SLACK_WEBHOOK_URL || '',
  process.env.SLACK_DEFAULT_CHANNEL || '#support-alerts'
); 