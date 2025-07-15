import { createClient } from '@supabase/supabase-js';

interface LaunchCampaign {
  id: string;
  name: string;
  platform: 'producthunt' | 'hackernews' | 'reddit' | 'twitter';
  launch_date: string;
  status: 'planning' | 'preparing' | 'launched' | 'completed' | 'cancelled';
  target_metrics: LaunchMetrics;
  actual_metrics: LaunchMetrics;
  created_at: string;
  updated_at: string;
}

interface LaunchMetrics {
  upvotes: number;
  comments: number;
  page_views: number;
  signups: number;
  conversions: number;
  revenue: number;
  press_mentions: number;
  social_shares: number;
}

interface LaunchAsset {
  id: string;
  campaign_id: string;
  type: 'video' | 'image' | 'screenshot' | 'gif' | 'document';
  title: string;
  description: string;
  url: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  created_at: string;
  updated_at: string;
}

interface LaunchContent {
  id: string;
  campaign_id: string;
  type: 'title' | 'tagline' | 'description' | 'features' | 'pricing';
  content: string;
  version: number;
  status: 'draft' | 'review' | 'approved' | 'published';
  created_at: string;
  updated_at: string;
}

interface LaunchTask {
  id: string;
  campaign_id: string;
  title: string;
  description: string;
  category: 'content' | 'design' | 'marketing' | 'technical' | 'community';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  assigned_to?: string;
  due_date: string;
  completed_at?: string;
  created_at: string;
}

export class ProductHuntLaunchSystem {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async createLaunchCampaign(campaign: Omit<LaunchCampaign, 'id' | 'created_at' | 'updated_at' | 'actual_metrics'>): Promise<LaunchCampaign> {
    try {
      const newCampaign: LaunchCampaign = {
        ...campaign,
        id: `launch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        actual_metrics: {
          upvotes: 0,
          comments: 0,
          page_views: 0,
          signups: 0,
          conversions: 0,
          revenue: 0,
          press_mentions: 0,
          social_shares: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('launch_campaigns')
        .insert(newCampaign)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating launch campaign:', error);
      throw error;
    }
  }

  async generateLaunchAssets(campaignId: string): Promise<LaunchAsset[]> {
    try {
      const assets: Omit<LaunchAsset, 'id' | 'created_at' | 'updated_at'>[] = [
        {
          campaign_id: campaignId,
          type: 'video',
          title: 'SupportIQ Demo Video',
          description: '2-minute demo showing AI-powered support automation in action',
          url: '/assets/launch/demo-video.mp4',
          status: 'draft'
        },
        {
          campaign_id: campaignId,
          type: 'image',
          title: 'ROI Dashboard Screenshot',
          description: 'Screenshot showing 8560% ROI and $8,470 monthly savings',
          url: '/assets/launch/roi-dashboard.png',
          status: 'draft'
        },
        {
          campaign_id: campaignId,
          type: 'image',
          title: 'Deflection Analytics',
          description: 'Visual showing 68% ticket deflection rate',
          url: '/assets/launch/deflection-analytics.png',
          status: 'draft'
        },
        {
          campaign_id: campaignId,
          type: 'image',
          title: 'Customer Testimonials',
          description: 'Screenshot of customer success stories and testimonials',
          url: '/assets/launch/testimonials.png',
          status: 'draft'
        },
        {
          campaign_id: campaignId,
          type: 'gif',
          title: 'Live Automation Demo',
          description: 'GIF showing real-time ticket automation',
          url: '/assets/launch/automation-demo.gif',
          status: 'draft'
        }
      ];

      const createdAssets: LaunchAsset[] = [];

      for (const asset of assets) {
        const { data, error } = await this.supabase
          .from('launch_assets')
          .insert({
            ...asset,
            id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (!error && data) {
          createdAssets.push(data);
        }
      }

      return createdAssets;
    } catch (error) {
      console.error('Error generating launch assets:', error);
      return [];
    }
  }

  async generateLaunchContent(campaignId: string): Promise<LaunchContent[]> {
    try {
      const content: Omit<LaunchContent, 'id' | 'created_at' | 'updated_at'>[] = [
        {
          campaign_id: campaignId,
          type: 'title',
          content: 'SupportIQ - AI-Powered Support Automation',
          version: 1,
          status: 'draft'
        },
        {
          campaign_id: campaignId,
          type: 'tagline',
          content: 'Reduce support tickets by 68% with AI automation. Achieve 8560% ROI in 30 days.',
          version: 1,
          status: 'draft'
        },
        {
          campaign_id: campaignId,
          type: 'description',
          content: `SupportIQ uses AI to automatically resolve customer support tickets, reducing your support workload by 68% while improving response times from 8+ hours to under 2.3 hours.

🎯 Key Features:
• AI-powered ticket analysis and auto-responses
• 68% average ticket deflection rate
• 8560% ROI guaranteed with 30-day money-back guarantee
• Seamless integration with Intercom, Zendesk, and more
• Real-time analytics and performance tracking

💰 ROI Calculator:
Companies using SupportIQ save an average of $8,470/month while achieving 8560% ROI. Our customers include startups and enterprises across various industries.

🚀 Get Started:
Start your free trial today and see results within 30 days, or get your money back. No questions asked.

Perfect for support teams looking to scale efficiently without hiring more agents.`,
          version: 1,
          status: 'draft'
        },
        {
          campaign_id: campaignId,
          type: 'features',
          content: `• AI Ticket Analysis & Auto-Responses
• 68% Average Ticket Deflection
• Real-time Analytics Dashboard
• Seamless Tool Integrations
• 30-Day Money-Back Guarantee
• 8560% Average ROI
• 2.3 Hour Average Response Time
• Customer Satisfaction Tracking`,
          version: 1,
          status: 'draft'
        },
        {
          campaign_id: campaignId,
          type: 'pricing',
          content: `Starter: $99/month - Perfect for small teams
Professional: $299/month - Advanced automation features
Enterprise: $799/month - Full AI automation suite

All plans include 30-day money-back guarantee and achieve 500%+ ROI.`,
          version: 1,
          status: 'draft'
        }
      ];

      const createdContent: LaunchContent[] = [];

      for (const item of content) {
        const { data, error } = await this.supabase
          .from('launch_content')
          .insert({
            ...item,
            id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (!error && data) {
          createdContent.push(data);
        }
      }

      return createdContent;
    } catch (error) {
      console.error('Error generating launch content:', error);
      return [];
    }
  }

  async createLaunchTasks(campaignId: string): Promise<LaunchTask[]> {
    try {
      const tasks: Omit<LaunchTask, 'id' | 'created_at'>[] = [
        // Content Tasks
        {
          campaign_id: campaignId,
          title: 'Create Demo Video',
          description: 'Record 2-minute demo video showing SupportIQ in action',
          category: 'content',
          priority: 'critical',
          status: 'todo',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          campaign_id: campaignId,
          title: 'Design Launch Graphics',
          description: 'Create ProductHunt launch images and screenshots',
          category: 'design',
          priority: 'high',
          status: 'todo',
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          campaign_id: campaignId,
          title: 'Write Launch Description',
          description: 'Craft compelling ProductHunt description and tagline',
          category: 'content',
          priority: 'high',
          status: 'todo',
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          campaign_id: campaignId,
          title: 'Prepare Customer Testimonials',
          description: 'Collect and format customer testimonials for launch',
          category: 'content',
          priority: 'medium',
          status: 'todo',
          due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        // Marketing Tasks
        {
          campaign_id: campaignId,
          title: 'Build Launch Email List',
          description: 'Create email list of potential ProductHunt voters',
          category: 'marketing',
          priority: 'high',
          status: 'todo',
          due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          campaign_id: campaignId,
          title: 'Prepare Social Media Campaign',
          description: 'Plan social media posts for launch day',
          category: 'marketing',
          priority: 'medium',
          status: 'todo',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          campaign_id: campaignId,
          title: 'Reach Out to Influencers',
          description: 'Contact relevant influencers and bloggers',
          category: 'marketing',
          priority: 'medium',
          status: 'todo',
          due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        // Technical Tasks
        {
          campaign_id: campaignId,
          title: 'Optimize Landing Page',
          description: 'Ensure landing page is optimized for ProductHunt traffic',
          category: 'technical',
          priority: 'high',
          status: 'todo',
          due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          campaign_id: campaignId,
          title: 'Set Up Analytics Tracking',
          description: 'Configure analytics to track launch performance',
          category: 'technical',
          priority: 'medium',
          status: 'todo',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        // Community Tasks
        {
          campaign_id: campaignId,
          title: 'Engage with ProductHunt Community',
          description: 'Start engaging with ProductHunt community before launch',
          category: 'community',
          priority: 'high',
          status: 'todo',
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          campaign_id: campaignId,
          title: 'Prepare Launch Day Support',
          description: 'Ensure team is ready to respond to comments and questions',
          category: 'community',
          priority: 'critical',
          status: 'todo',
          due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const createdTasks: LaunchTask[] = [];

      for (const task of tasks) {
        const { data, error } = await this.supabase
          .from('launch_tasks')
          .insert({
            ...task,
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (!error && data) {
          createdTasks.push(data);
        }
      }

      return createdTasks;
    } catch (error) {
      console.error('Error creating launch tasks:', error);
      return [];
    }
  }

  async updateTaskStatus(taskId: string, status: LaunchTask['status']): Promise<void> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      await this.supabase
        .from('launch_tasks')
        .update(updates)
        .eq('id', taskId);
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  async updateLaunchMetrics(campaignId: string, metrics: Partial<LaunchMetrics>): Promise<void> {
    try {
      await this.supabase
        .from('launch_campaigns')
        .update({
          actual_metrics: this.supabase.sql`actual_metrics || ${JSON.stringify(metrics)}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);
    } catch (error) {
      console.error('Error updating launch metrics:', error);
      throw error;
    }
  }

  async generateLaunchPage(): Promise<any> {
    try {
      // Get launch content
      const { data: content } = await this.supabase
        .from('launch_content')
        .select('*')
        .eq('status', 'approved');

      // Get launch assets
      const { data: assets } = await this.supabase
        .from('launch_assets')
        .select('*')
        .eq('status', 'approved');

      // Get customer testimonials
      const { data: testimonials } = await this.supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'published')
        .eq('featured', true)
        .limit(3);

      const contentMap = content?.reduce((acc: any, item: LaunchContent) => {
        acc[item.type] = item.content;
        return acc;
      }, {}) || {};

      return {
        title: contentMap.title || 'SupportIQ - AI-Powered Support Automation',
        tagline: contentMap.tagline || 'Reduce support tickets by 68% with AI automation',
        description: contentMap.description || '',
        features: contentMap.features || '',
        pricing: contentMap.pricing || '',
        assets: assets || [],
        testimonials: testimonials || [],
        seo: {
          title: 'SupportIQ - AI Support Automation | ProductHunt Launch',
          description: 'Launching on ProductHunt! Reduce support tickets by 68% with AI automation. 8560% ROI guaranteed.',
          keywords: ['support automation', 'AI', 'customer support', 'ProductHunt', 'launch']
        }
      };
    } catch (error) {
      console.error('Error generating launch page:', error);
      return null;
    }
  }

  async getLaunchProgress(campaignId: string): Promise<any> {
    try {
      const { data: tasks } = await this.supabase
        .from('launch_tasks')
        .select('*')
        .eq('campaign_id', campaignId);

      const { data: assets } = await this.supabase
        .from('launch_assets')
        .select('*')
        .eq('campaign_id', campaignId);

      const { data: content } = await this.supabase
        .from('launch_content')
        .select('*')
        .eq('campaign_id', campaignId);

      if (!tasks || !assets || !content) return null;

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t: LaunchTask) => t.status === 'completed').length;
      const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const totalAssets = assets.length;
      const approvedAssets = assets.filter((a: LaunchAsset) => a.status === 'approved').length;
      const assetProgress = totalAssets > 0 ? (approvedAssets / totalAssets) * 100 : 0;

      const totalContent = content.length;
      const approvedContent = content.filter((c: LaunchContent) => c.status === 'approved').length;
      const contentProgress = totalContent > 0 ? (approvedContent / totalContent) * 100 : 0;

      const criticalTasks = tasks.filter((t: LaunchTask) => t.priority === 'critical');
      const completedCriticalTasks = criticalTasks.filter((t: LaunchTask) => t.status === 'completed').length;
      const criticalProgress = criticalTasks.length > 0 ? (completedCriticalTasks / criticalTasks.length) * 100 : 0;

      return {
        overall_progress: Math.round((taskProgress + assetProgress + contentProgress) / 3),
        task_progress: taskProgress,
        asset_progress: assetProgress,
        content_progress: contentProgress,
        critical_progress: criticalProgress,
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          remaining: totalTasks - completedTasks
        },
        assets: {
          total: totalAssets,
          approved: approvedAssets,
          remaining: totalAssets - approvedAssets
        },
        content: {
          total: totalContent,
          approved: approvedContent,
          remaining: totalContent - approvedContent
        },
        readiness_score: this.calculateReadinessScore(taskProgress, assetProgress, contentProgress, criticalProgress)
      };
    } catch (error) {
      console.error('Error getting launch progress:', error);
      return null;
    }
  }

  private calculateReadinessScore(taskProgress: number, assetProgress: number, contentProgress: number, criticalProgress: number): number {
    // Weight critical tasks more heavily
    const weightedScore = (taskProgress * 0.3) + (assetProgress * 0.25) + (contentProgress * 0.25) + (criticalProgress * 0.2);
    return Math.round(weightedScore);
  }

  async generateLaunchChecklist(): Promise<any> {
    try {
      const checklist = {
        pre_launch: [
          'Demo video recorded and edited',
          'ProductHunt images designed',
          'Launch description written and reviewed',
          'Customer testimonials collected',
          'Email list built',
          'Social media campaign planned',
          'Influencer outreach completed',
          'Landing page optimized',
          'Analytics tracking configured',
          'Community engagement started'
        ],
        launch_day: [
          'ProductHunt submission ready',
          'Team available for support',
          'Social media posts scheduled',
          'Email campaign ready',
          'Analytics monitoring active',
          'Customer support team briefed'
        ],
        post_launch: [
          'Monitor comments and respond',
          'Track metrics and performance',
          'Engage with community',
          'Follow up with signups',
          'Analyze results and iterate'
        ]
      };

      return checklist;
    } catch (error) {
      console.error('Error generating launch checklist:', error);
      return null;
    }
  }
} 