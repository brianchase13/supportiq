import { TrialManager } from '@/lib/trial/manager';

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      then: jest.fn().mockResolvedValue({ error: null })
    })
  }
}));

jest.mock('@/lib/services/email-service', () => ({
  EmailService: {
    sendTrialExpirationEmail: jest.fn()
  }
}));

describe('TrialManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TRIAL_LIMITS', () => {
    it('should have correct default trial limits', () => {
      expect(TrialManager.TRIAL_LIMITS).toEqual({
        ai_responses: 100,
        team_members: 2,
        integrations: 1,
        tickets_per_month: 1000,
        storage_gb: 1
      });
    });

    it('should have correct trial duration', () => {
      expect(TrialManager.TRIAL_DAYS).toBe(14);
    });
  });

  describe('getTrialStatus', () => {
    it('should handle successful trial retrieval', async () => {
      const mockTrial = {
        id: 'trial-1',
        user_id: 'user-1',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        limits: TrialManager.TRIAL_LIMITS,
        usage: {
          ai_responses_used: 0,
          team_members_added: 0,
          integrations_connected: 0,
          tickets_processed: 0,
          storage_used_gb: 0
        }
      };

      const mockSupabase = require('@/lib/supabase/client').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockTrial,
          error: null
        })
      });

      const result = await TrialManager.getTrialStatus('user-1');

      expect(result).toEqual(mockTrial);
      expect(mockSupabase.from).toHaveBeenCalledWith('trials');
    });

    it('should handle user not found', async () => {
      const mockSupabase = require('@/lib/supabase/client').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows returned' }
        })
      });

      const result = await TrialManager.getTrialStatus('nonexistent-user');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const mockSupabase = require('@/lib/supabase/client').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' }
        })
      });

      await expect(TrialManager.getTrialStatus('user-1')).rejects.toThrow('Failed to get trial status');
    });
  });

  describe('checkTrialLimits', () => {
    it('should allow usage within limits', async () => {
      const mockTrial = {
        id: 'trial-1',
        user_id: 'user-1',
        status: 'active',
        limits: {
          ai_responses: 100,
          team_members: 2,
          integrations: 1,
          tickets_per_month: 1000,
          storage_gb: 1
        },
        usage: {
          ai_responses_used: 50,
          team_members_added: 1,
          integrations_connected: 1,
          tickets_processed: 150,
          storage_used_gb: 0.5
        }
      };

      // Mock getTrialStatus to return the trial
      const mockSupabase = require('@/lib/supabase/client').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockTrial,
          error: null
        })
      });

      const result = await TrialManager.checkTrialLimits('user-1', 'ai_responses_used');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(50);
      expect(result.limit).toBe(100);
      expect(result.used).toBe(50);
    });

    it('should reject usage when limit exceeded', async () => {
      const mockTrial = {
        id: 'trial-1',
        user_id: 'user-1',
        status: 'active',
        limits: {
          ai_responses: 100,
          team_members: 2,
          integrations: 1,
          tickets_per_month: 1000,
          storage_gb: 1
        },
        usage: {
          ai_responses_used: 100,
          team_members_added: 1,
          integrations_connected: 1,
          tickets_processed: 150,
          storage_used_gb: 0.5
        }
      };

      const mockSupabase = require('@/lib/supabase/client').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockTrial,
          error: null
        })
      });

      const result = await TrialManager.checkTrialLimits('user-1', 'ai_responses_used');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.limit).toBe(100);
      expect(result.used).toBe(100);
    });

    it('should handle no trial found', async () => {
      const mockSupabase = require('@/lib/supabase/client').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      });

      const result = await TrialManager.checkTrialLimits('user-1', 'ai_responses_used');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.limit).toBe(0);
      expect(result.used).toBe(0);
    });
  });

  describe('startTrial', () => {
    it('should handle database errors during trial start', async () => {
      const mockSupabase = require('@/lib/supabase/client').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      });

      await expect(TrialManager.startTrial('user-1')).rejects.toThrow('Failed to start trial');
    });
  });

  describe('trackUsage', () => {
    it('should handle database errors during usage tracking', async () => {
      const mockSupabase = require('@/lib/supabase/client').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((cb) => {
          // Immediately call the callback with error
          return Promise.resolve(cb({ error: { message: 'Database error' } }));
        })
      });

      await expect(TrialManager.trackUsage('user-1', 'ai_responses_used', 1)).rejects.toThrow('Failed to track trial usage');
    });
  });
}); 