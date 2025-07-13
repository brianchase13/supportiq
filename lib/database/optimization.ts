import { supabaseAdmin } from '@/lib/supabase/client';
import { log } from '@/lib/logging/logger';
import { getConfig } from '@/lib/config/constants';

// Database optimization utilities - PERFORMANCE MATTERS

export class DatabaseOptimizer {
  private config = getConfig();

  // Create database indexes for better performance
  async createIndexes(): Promise<void> {
    try {
      log.info('Creating database indexes for performance optimization');

      const indexes = [
        // Users table indexes
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status)',
        'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
        
        // Tickets table indexes
        'CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_customer_email ON tickets(customer_email)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_deflection_potential ON tickets(deflection_potential)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_user_created ON tickets(user_id, created_at)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_category_status ON tickets(category, status)',
        
        // Analytics table indexes
        'CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date)',
        'CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON analytics(user_id, date)',
        
        // Deflection responses table indexes
        'CREATE INDEX IF NOT EXISTS idx_deflection_responses_ticket_id ON deflection_responses(ticket_id)',
        'CREATE INDEX IF NOT EXISTS idx_deflection_responses_user_id ON deflection_responses(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_deflection_responses_created_at ON deflection_responses(created_at)',
        
        // User settings table indexes
        'CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id)',
      ];

      for (const indexQuery of indexes) {
        await supabaseAdmin.rpc('exec_sql', { sql: indexQuery });
      }

      log.info('Database indexes created successfully');
    } catch (error) {
      log.error('Failed to create database indexes', error as Error);
      throw error;
    }
  }

  // Optimize table structure
  async optimizeTables(): Promise<void> {
    try {
      log.info('Optimizing database table structure');

      const optimizations = [
        // Add constraints for data integrity
        'ALTER TABLE tickets ADD CONSTRAINT IF NOT EXISTS check_priority CHECK (priority IN (\'low\', \'medium\', \'high\', \'urgent\'))',
        'ALTER TABLE tickets ADD CONSTRAINT IF NOT EXISTS check_status CHECK (status IN (\'open\', \'closed\', \'pending\', \'resolved\'))',
        'ALTER TABLE tickets ADD CONSTRAINT IF NOT EXISTS check_sentiment_score CHECK (sentiment_score >= -1 AND sentiment_score <= 1)',
        
        // Add foreign key constraints
        'ALTER TABLE tickets ADD CONSTRAINT IF NOT EXISTS fk_tickets_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
        'ALTER TABLE analytics ADD CONSTRAINT IF NOT EXISTS fk_analytics_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
        'ALTER TABLE deflection_responses ADD CONSTRAINT IF NOT EXISTS fk_deflection_responses_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
        'ALTER TABLE user_settings ADD CONSTRAINT IF NOT EXISTS fk_user_settings_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
      ];

      for (const optimization of optimizations) {
        await supabaseAdmin.rpc('exec_sql', { sql: optimization });
      }

      log.info('Database table optimization completed');
    } catch (error) {
      log.error('Failed to optimize database tables', error as Error);
      throw error;
    }
  }

  // Implement query optimization
  async optimizeQueries(): Promise<void> {
    try {
      log.info('Implementing query optimization strategies');

      // Create materialized views for complex analytics
      const materializedViews = [
        `CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_analytics AS
         SELECT 
           user_id,
           DATE(created_at) as date,
           COUNT(*) as total_tickets,
           COUNT(CASE WHEN deflection_potential = 'high' THEN 1 END) as high_deflection_tickets,
           COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_tickets,
           AVG(sentiment_score) as avg_sentiment,
           AVG(CASE WHEN response_time_minutes IS NOT NULL THEN response_time_minutes END) as avg_response_time
         FROM tickets
         GROUP BY user_id, DATE(created_at)`,
        
        `CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_performance AS
         SELECT 
           user_id,
           COUNT(*) as total_tickets,
           COUNT(CASE WHEN deflection_potential = 'high' THEN 1 END) as high_deflection_count,
           COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count,
           AVG(sentiment_score) as avg_sentiment,
           AVG(CASE WHEN response_time_minutes IS NOT NULL THEN response_time_minutes END) as avg_response_time,
           MAX(created_at) as last_ticket_date
         FROM tickets
         GROUP BY user_id`,
      ];

      for (const viewQuery of materializedViews) {
        await supabaseAdmin.rpc('exec_sql', { sql: viewQuery });
      }

      log.info('Query optimization completed');
    } catch (error) {
      log.error('Failed to optimize queries', error as Error);
      throw error;
    }
  }

  // Implement connection pooling
  async setupConnectionPooling(): Promise<void> {
    try {
      log.info('Setting up database connection pooling');

      // Configure connection pool settings
      const poolConfig = {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };

      // This would be configured in your Supabase dashboard
      // For now, we'll log the configuration
      log.info('Connection pooling configuration', poolConfig);
    } catch (error) {
      log.error('Failed to setup connection pooling', error as Error);
      throw error;
    }
  }

  // Implement caching strategy
  async setupCaching(): Promise<void> {
    try {
      log.info('Setting up database caching strategy');

      // Create cache tables for frequently accessed data
      const cacheTables = [
        `CREATE TABLE IF NOT EXISTS cache_user_analytics (
           user_id UUID PRIMARY KEY,
           data JSONB NOT NULL,
           created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
           updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
         )`,
        
        `CREATE TABLE IF NOT EXISTS cache_ticket_insights (
           ticket_id UUID PRIMARY KEY,
           analysis_data JSONB NOT NULL,
           created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
         )`,
      ];

      for (const tableQuery of cacheTables) {
        await supabaseAdmin.rpc('exec_sql', { sql: tableQuery });
      }

      log.info('Caching strategy setup completed');
    } catch (error) {
      log.error('Failed to setup caching', error as Error);
      throw error;
    }
  }

  // Monitor database performance
  async monitorPerformance(): Promise<{
    slowQueries: any[];
    tableSizes: any[];
    indexUsage: any[];
  }> {
    try {
      log.info('Monitoring database performance');

      // Get slow queries (this would require pg_stat_statements extension)
      const slowQueries = await supabaseAdmin.rpc('get_slow_queries', {
        threshold_ms: 1000
      });

      // Get table sizes
      const tableSizes = await supabaseAdmin.rpc('get_table_sizes');

      // Get index usage statistics
      const indexUsage = await supabaseAdmin.rpc('get_index_usage');

      const performanceData = {
        slowQueries: slowQueries.data || [],
        tableSizes: tableSizes.data || [],
        indexUsage: indexUsage.data || [],
      };

      log.info('Database performance monitoring completed', {
        slow_queries_count: performanceData.slowQueries.length,
        tables_count: performanceData.tableSizes.length,
        indexes_count: performanceData.indexUsage.length,
      });

      return performanceData;
    } catch (error) {
      log.error('Failed to monitor database performance', error as Error);
      throw error;
    }
  }

  // Clean up old data
  async cleanupOldData(): Promise<void> {
    try {
      log.info('Cleaning up old data for performance');

      const retentionDays = this.config.DATABASE.RETENTION_DAYS;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const cleanupQueries = [
        // Clean up old analytics data
        `DELETE FROM analytics WHERE date < '${cutoffDate.toISOString()}'`,
        
        // Clean up old cache data
        `DELETE FROM cache_user_analytics WHERE updated_at < '${cutoffDate.toISOString()}'`,
        `DELETE FROM cache_ticket_insights WHERE created_at < '${cutoffDate.toISOString()}'`,
        
        // Clean up old deflection responses
        `DELETE FROM deflection_responses WHERE created_at < '${cutoffDate.toISOString()}'`,
      ];

      for (const query of cleanupQueries) {
        const result = await supabaseAdmin.rpc('exec_sql', { sql: query });
        log.info(`Cleanup query executed: ${query}`, { affected_rows: result });
      }

      log.info('Data cleanup completed');
    } catch (error) {
      log.error('Failed to cleanup old data', error as Error);
      throw error;
    }
  }

  // Optimize batch operations
  async optimizeBatchOperations(): Promise<void> {
    try {
      log.info('Optimizing batch operations');

      // Create batch processing functions
      const batchFunctions = [
        `CREATE OR REPLACE FUNCTION batch_insert_tickets(tickets_data JSONB)
         RETURNS VOID AS $$
         BEGIN
           INSERT INTO tickets (
             user_id, subject, content, customer_email, priority, category,
             sentiment, sentiment_score, status, deflection_potential,
             keywords, tags, metadata, created_at, updated_at
           )
           SELECT 
             (value->>'user_id')::UUID,
             value->>'subject',
             value->>'content',
             value->>'customer_email',
             value->>'priority',
             value->>'category',
             value->>'sentiment',
             (value->>'sentiment_score')::FLOAT,
             value->>'status',
             value->>'deflection_potential',
             ARRAY(SELECT jsonb_array_elements_text(value->'keywords')),
             ARRAY(SELECT jsonb_array_elements_text(value->'tags')),
             value->'metadata',
             NOW(),
             NOW()
           FROM jsonb_array_elements(tickets_data);
         END;
         $$ LANGUAGE plpgsql;`,
      ];

      for (const functionQuery of batchFunctions) {
        await supabaseAdmin.rpc('exec_sql', { sql: functionQuery });
      }

      log.info('Batch operations optimization completed');
    } catch (error) {
      log.error('Failed to optimize batch operations', error as Error);
      throw error;
    }
  }

  // Run full optimization
  async runFullOptimization(): Promise<void> {
    try {
      log.info('Starting full database optimization');

      await this.createIndexes();
      await this.optimizeTables();
      await this.optimizeQueries();
      await this.setupConnectionPooling();
      await this.setupCaching();
      await this.optimizeBatchOperations();
      await this.cleanupOldData();

      log.info('Full database optimization completed successfully');
    } catch (error) {
      log.error('Full database optimization failed', error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseOptimizer = new DatabaseOptimizer(); 