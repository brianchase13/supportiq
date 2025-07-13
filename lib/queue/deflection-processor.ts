import { supabaseAdmin } from '@/lib/supabase/client';
import { TicketDeflectionEngine, type TicketData, type DeflectionSettings } from '@/lib/deflection/engine';

export interface DeflectionJob {
  id: string;
  user_id: string;
  ticket_data: TicketData;
  webhook_event?: any;
  priority: 'high' | 'normal' | 'low';
  max_retries: number;
  retry_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  result?: any;
  created_at: string;
  updated_at: string;
}

export class DeflectionProcessor {
  private isProcessing = false;
  private processingInterval?: NodeJS.Timeout;
  private readonly batchSize = 5; // Process 5 jobs simultaneously
  private readonly processIntervalMs = 10000; // Check for jobs every 10 seconds

  constructor() {
    // Start processing in development/production
    if (process.env.NODE_ENV !== 'test') {
      this.startProcessing();
    }
  }

  /**
   * Add a deflection job to the queue
   */
  async enqueueDeflection(
    userId: string,
    ticketData: TicketData,
    webhookEvent?: any,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<string> {
    const jobId = `deflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: Omit<DeflectionJob, 'id'> = {
      user_id: userId,
      ticket_data: ticketData,
      webhook_event: webhookEvent,
      priority,
      max_retries: 3,
      retry_count: 0,
      status: 'pending',
      scheduled_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseAdmin
      .from('deflection_jobs')
      .insert({ id: jobId, ...job });

    if (error) {
      console.error('Failed to enqueue deflection job:', error);
      throw error;
    }

    console.log(`Enqueued deflection job ${jobId} for user ${userId} with priority ${priority}`);
    return jobId;
  }

  /**
   * Start the background job processor
   */
  startProcessing(): void {
    if (this.isProcessing) {
      console.log('Deflection processor already running');
      return;
    }

    this.isProcessing = true;
    console.log('Starting deflection job processor...');

    this.processingInterval = setInterval(async () => {
      try {
        await this.processJobs();
      } catch (error) {
        console.error('Error in job processing cycle:', error);
      }
    }, this.processIntervalMs);
  }

  /**
   * Stop the background job processor
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }
    this.isProcessing = false;
    console.log('Stopped deflection job processor');
  }

  /**
   * Process pending jobs from the queue
   */
  private async processJobs(): Promise<void> {
    // Get pending jobs with priority ordering
    const { data: jobs, error } = await supabaseAdmin
      .from('deflection_jobs')
      .select('*')
      .in('status', ['pending', 'retrying'])
      .lte('scheduled_at', new Date().toISOString())
      .order('priority', { ascending: false }) // high, normal, low
      .order('created_at', { ascending: true })   // FIFO within priority
      .limit(this.batchSize);

    if (error) {
      console.error('Failed to fetch deflection jobs:', error);
      return;
    }

    if (!jobs || jobs.length === 0) {
      return;
    }

    console.log(`Processing ${jobs.length} deflection jobs...`);

    // Process jobs in parallel
    const processingPromises = jobs.map(job => this.processJob(job));
    await Promise.allSettled(processingPromises);
  }

  /**
   * Process a single deflection job
   */
  private async processJob(job: DeflectionJob): Promise<void> {
    const startTime = new Date();

    try {
      // Mark job as processing
      await this.updateJobStatus(job.id, 'processing', { started_at: startTime.toISOString() });

      // Get user's deflection settings
      const { data: settings } = await supabaseAdmin
        .from('deflection_settings')
        .select('*')
        .eq('user_id', job.user_id)
        .single();

      if (!settings) {
        throw new Error('No deflection settings found for user');
      }

      // Initialize deflection engine
      const engine = new TicketDeflectionEngine(job.user_id, settings);

      // Process the ticket
      const result = await engine.processTicket(job.ticket_data);

      // Mark job as completed
      await this.updateJobStatus(job.id, 'completed', {
        completed_at: new Date().toISOString(),
        result: result
      });

      console.log(`Successfully processed deflection job ${job.id}:`, {
        shouldRespond: result.shouldRespond,
        reason: result.reason,
        confidence: result.response?.confidence_score
      });

    } catch (error) {
      console.error(`Error processing deflection job ${job.id}:`, error);
      await this.handleJobError(job, error);
    }
  }

  /**
   * Handle job processing errors with retry logic
   */
  private async handleJobError(job: DeflectionJob, error: any): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const newRetryCount = job.retry_count + 1;

    if (newRetryCount <= job.max_retries) {
      // Schedule retry with exponential backoff
      const backoffMs = Math.min(1000 * Math.pow(2, newRetryCount), 300000); // Max 5 minutes
      const retryAt = new Date(Date.now() + backoffMs).toISOString();

      await this.updateJobStatus(job.id, 'retrying', {
        retry_count: newRetryCount,
        scheduled_at: retryAt,
        error_message: errorMessage
      });

      console.log(`Scheduled retry ${newRetryCount}/${job.max_retries} for job ${job.id} in ${backoffMs}ms`);
    } else {
      // Max retries exceeded, mark as failed
      await this.updateJobStatus(job.id, 'failed', {
        error_message: errorMessage,
        completed_at: new Date().toISOString()
      });

      console.error(`Job ${job.id} failed after ${job.max_retries} retries:`, errorMessage);

      // Log critical failure for monitoring
      await this.logCriticalFailure(job, errorMessage);
    }
  }

  /**
   * Update job status and metadata
   */
  private async updateJobStatus(
    jobId: string,
    status: DeflectionJob['status'],
    updates: Partial<DeflectionJob> = {}
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('deflection_jobs')
      .update({
        status,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (error) {
      console.error(`Failed to update job ${jobId} status to ${status}:`, error);
    }
  }

  /**
   * Log critical failures for monitoring and alerting
   */
  private async logCriticalFailure(job: DeflectionJob, errorMessage: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('system_errors')
        .insert({
          type: 'deflection_job_failure',
          severity: 'critical',
          message: `Deflection job ${job.id} failed permanently: ${errorMessage}`,
          metadata: {
            job_id: job.id,
            user_id: job.user_id,
            ticket_id: job.ticket_data.id,
            retry_count: job.retry_count,
            error: errorMessage
          },
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log critical failure:', error);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    retrying: number;
    averageProcessingTime: number;
  }> {
    const { data: stats } = await supabaseAdmin
      .from('deflection_jobs')
      .select('status, started_at, completed_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

    if (!stats) {
      return {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        retrying: 0,
        averageProcessingTime: 0
      };
    }

    const statusCounts = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      retrying: 0
    };

    let totalProcessingTime = 0;
    let completedJobs = 0;

    stats.forEach(job => {
      statusCounts[job.status as keyof typeof statusCounts]++;

      if (job.status === 'completed' && job.started_at && job.completed_at) {
        const processingTime = new Date(job.completed_at).getTime() - new Date(job.started_at).getTime();
        totalProcessingTime += processingTime;
        completedJobs++;
      }
    });

    return {
      ...statusCounts,
      averageProcessingTime: completedJobs > 0 ? totalProcessingTime / completedJobs : 0
    };
  }

  /**
   * Cleanup old jobs (older than 7 days)
   */
  async cleanupOldJobs(): Promise<void> {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin
      .from('deflection_jobs')
      .delete()
      .lt('created_at', cutoffDate);

    if (error) {
      console.error('Failed to cleanup old jobs:', error);
    } else {
      console.log('Cleaned up old deflection jobs');
    }
  }
}

// Singleton instance
export const deflectionProcessor = new DeflectionProcessor();