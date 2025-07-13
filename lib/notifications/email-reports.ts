import { Resend } from 'resend';

interface EmailReportData {
  user: {
    email: string;
    name: string;
  };
  period: 'weekly' | 'monthly';
  metrics: {
    totalTickets: number;
    avgResponseTime: number;
    satisfactionScore: number;
    deflectionRate: number;
    monthlySavings: number;
    ticketsDeflected: number;
    timeSaved: number;
    roi: number;
  };
  insights: Array<{
    title: string;
    description: string;
    impact: string;
  }>;
  topIssues: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  agentPerformance: Array<{
    name: string;
    ticketsHandled: number;
    avgResponseTime: number;
    satisfactionScore: number;
  }>;
  recommendations: string[];
}

export class EmailReportService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  private generateWeeklyReportHTML(data: EmailReportData): string {
    const periodText = data.period === 'weekly' ? 'This Week' : 'This Month';
    const periodTitle = data.period === 'weekly' ? 'Weekly' : 'Monthly';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SupportIQ ${periodTitle} Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; }
          .metric-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .metric-item { text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px; }
          .metric-value { font-size: 24px; font-weight: bold; color: #0066FF; }
          .metric-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
          .insight-card { background: #f0f9ff; border-left: 4px solid #0066FF; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
          .issue-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .issue-table th, .issue-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          .issue-table th { background: #f8fafc; font-weight: 600; }
          .recommendation { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; border-radius: 0 8px 8px 0; }
          .cta-button { display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          @media (max-width: 600px) { .metric-grid { grid-template-columns: 1fr; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">SupportIQ ${periodTitle} Report</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${periodText} • ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="metric-card">
            <h2 style="margin: 0 0 20px 0; color: #1f2937;">Performance Summary</h2>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${data.metrics.deflectionRate}%</div>
                <div class="metric-label">Auto-Resolution Rate</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${data.metrics.avgResponseTime}m</div>
                <div class="metric-label">Avg Response Time</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${data.metrics.satisfactionScore}/5</div>
                <div class="metric-label">Customer Satisfaction</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">$${data.metrics.monthlySavings.toLocaleString()}</div>
                <div class="metric-label">Monthly Savings</div>
              </div>
            </div>
          </div>

          <div class="metric-card">
            <h2 style="margin: 0 0 20px 0; color: #1f2937;">AI Impact</h2>
            <div class="metric-grid">
              <div class="metric-item">
                <div class="metric-value">${data.metrics.ticketsDeflected.toLocaleString()}</div>
                <div class="metric-label">Tickets Deflected</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${data.metrics.timeSaved}h</div>
                <div class="metric-label">Time Saved</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${data.metrics.roi.toFixed(0)}%</div>
                <div class="metric-label">ROI</div>
              </div>
              <div class="metric-item">
                <div class="metric-value">${data.metrics.totalTickets.toLocaleString()}</div>
                <div class="metric-label">Total Tickets</div>
              </div>
            </div>
          </div>

          ${data.insights.length > 0 ? `
            <div class="metric-card">
              <h2 style="margin: 0 0 20px 0; color: #1f2937;">AI Insights</h2>
              ${data.insights.map(insight => `
                <div class="insight-card">
                  <h3 style="margin: 0 0 8px 0; color: #0066FF;">${insight.title}</h3>
                  <p style="margin: 0 0 8px 0;">${insight.description}</p>
                  <p style="margin: 0; font-weight: 600; color: #059669;">${insight.impact}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${data.topIssues.length > 0 ? `
            <div class="metric-card">
              <h2 style="margin: 0 0 20px 0; color: #1f2937;">Top Issues</h2>
              <table class="issue-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.topIssues.map(issue => `
                    <tr>
                      <td>${issue.category}</td>
                      <td>${issue.count}</td>
                      <td>${issue.percentage}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${data.agentPerformance.length > 0 ? `
            <div class="metric-card">
              <h2 style="margin: 0 0 20px 0; color: #1f2937;">Team Performance</h2>
              <table class="issue-table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Tickets</th>
                    <th>Response Time</th>
                    <th>Satisfaction</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.agentPerformance.map(agent => `
                    <tr>
                      <td>${agent.name}</td>
                      <td>${agent.ticketsHandled}</td>
                      <td>${agent.avgResponseTime}m</td>
                      <td>${agent.satisfactionScore}/5</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${data.recommendations.length > 0 ? `
            <div class="metric-card">
              <h2 style="margin: 0 0 20px 0; color: #1f2937;">Recommendations</h2>
              ${data.recommendations.map(rec => `
                <div class="recommendation">
                  <p style="margin: 0;">${rec}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta-button">
              View Full Dashboard
            </a>
          </div>

          <div class="footer">
            <p>This report was generated automatically by SupportIQ</p>
            <p>Questions? Reply to this email or contact our support team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWeeklyReport(data: EmailReportData): Promise<void> {
    try {
      const subject = `SupportIQ ${data.period === 'weekly' ? 'Weekly' : 'Monthly'} Report - ${new Date().toLocaleDateString()}`;
      const html = this.generateWeeklyReportHTML(data);

      await this.resend.emails.send({
        from: 'SupportIQ <reports@supportiq.ai>',
        to: [data.user.email],
        subject,
        html
      });

      console.log(`Weekly report sent to ${data.user.email}`);
    } catch (error) {
      console.error('Failed to send weekly report:', error);
      throw error;
    }
  }

  async sendCrisisAlert(data: {
    user: { email: string; name: string };
    alert: {
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      description: string;
      metrics?: Record<string, any>;
      recommendations?: string[];
    };
  }): Promise<void> {
    try {
      const severityColors = {
        low: '#36a64f',
        medium: '#ffa500',
        high: '#ff6b35',
        critical: '#ff0000'
      };

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${severityColors[data.alert.severity]}; color: white; padding: 30px; border-radius: 12px; text-align: center; }
            .content { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 15px 0; }
            .cta-button { display: inline-block; background: ${severityColors[data.alert.severity]}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🚨 Crisis Alert</h1>
              <p style="margin: 10px 0 0 0;">${data.alert.title}</p>
            </div>
            
            <div class="content">
              <p>${data.alert.description}</p>
              
              ${data.alert.metrics ? `
                <h3>Current Metrics:</h3>
                <ul>
                  ${Object.entries(data.alert.metrics).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
                </ul>
              ` : ''}
              
              ${data.alert.recommendations ? `
                <h3>Recommended Actions:</h3>
                <ul>
                  ${data.alert.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta-button">
                  View Dashboard
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.resend.emails.send({
        from: 'SupportIQ <alerts@supportiq.ai>',
        to: [data.user.email],
        subject: `🚨 Crisis Alert: ${data.alert.title}`,
        html
      });

      console.log(`Crisis alert sent to ${data.user.email}`);
    } catch (error) {
      console.error('Failed to send crisis alert:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(data: {
    user: { email: string; name: string };
    setupUrl: string;
  }): Promise<void> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; }
            .content { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 15px 0; }
            .cta-button { display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Welcome to SupportIQ! 🚀</h1>
              <p style="margin: 10px 0 0 0;">AI-powered support analytics that cuts ticket costs by 30%</p>
            </div>
            
            <div class="content">
              <h2>Hi ${data.user.name},</h2>
              <p>Welcome to SupportIQ! You're about to transform your customer support with AI-powered analytics and automation.</p>
              
              <h3>What you'll get:</h3>
              <ul>
                <li><strong>30% reduction</strong> in support ticket costs</li>
                <li><strong>85%+ auto-resolution</strong> rate for common issues</li>
                <li><strong>Real-time insights</strong> into customer satisfaction</li>
                <li><strong>Automated responses</strong> that customers love</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.setupUrl}" class="cta-button">
                  Get Started Now
                </a>
              </div>
              
              <p>Need help? Our team is here to support you every step of the way.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.resend.emails.send({
        from: 'SupportIQ <welcome@supportiq.ai>',
        to: [data.user.email],
        subject: 'Welcome to SupportIQ! 🚀',
        html
      });

      console.log(`Welcome email sent to ${data.user.email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const emailReportService = new EmailReportService(); 