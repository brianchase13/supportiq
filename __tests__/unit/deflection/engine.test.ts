import { TicketDeflectionEngine, TicketData, DeflectionSettings, AIResponse } from '@/lib/deflection/engine';

// Mock all dependencies
jest.mock('@/lib/supabase/client', () => ({
  supabaseAdmin: {
    from: jest.fn().mockImplementation((table) => {
      if (table === 'knowledge_base') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ 
            data: [
              { id: 'kb-1', title: 'Password Reset', content: 'How to reset password...', category: 'account' }
            ], 
            error: null 
          })
        };
      }
      if (table === 'ai_responses' || table === 'tickets') {
        // Support .update().eq(...).eq(...)
        const eqChain = () => ({ eq: jest.fn().mockResolvedValue({ error: null }) });
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
          update: jest.fn().mockReturnValue({ eq: jest.fn().mockImplementation(eqChain) }),
          eq: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) })
        };
      }
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ 
            data: { 
              deflection_settings: {
                auto_response_enabled: true,
                confidence_threshold: 0.8,
                escalation_threshold: 0.6,
                response_language: 'en',
                business_hours_only: false,
                excluded_categories: ['billing'],
                escalation_keywords: ['urgent'],
                custom_instructions: 'Be very helpful'
              }
            }, 
            error: null 
          })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockReturnValue({ eq: jest.fn().mockImplementation(() => ({ eq: jest.fn().mockResolvedValue({ error: null }) })) }),
        eq: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        then: jest.fn().mockResolvedValue({ error: null })
      };
    })
  }
}));

jest.mock('@/lib/ai/response-templates', () => ({
  ResponseTemplateEngine: jest.fn().mockImplementation(() => ({
    getTemplates: jest.fn().mockResolvedValue([])
  }))
}));

// Mock OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn()
    }
  }
};

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockOpenAI)
}));

describe('TicketDeflectionEngine', () => {
  let engine: TicketDeflectionEngine;
  let mockSettings: DeflectionSettings;
  let mockTicket: TicketData;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSettings = {
      auto_response_enabled: true,
      confidence_threshold: 0.8,
      escalation_threshold: 0.6,
      response_language: 'en',
      business_hours_only: false,
      excluded_categories: [],
      escalation_keywords: ['urgent', 'emergency'],
      custom_instructions: undefined
    };

    mockTicket = {
      id: 'ticket-1',
      user_id: 'user-1',
      intercom_conversation_id: 'conv-1',
      content: 'How do I reset my password?',
      subject: 'Password Reset Help',
      customer_email: 'test@example.com',
      category: 'account',
      priority: 'normal',
      created_at: new Date().toISOString()
    };

    engine = new TicketDeflectionEngine('user-1', mockSettings);
  });

  describe('preflightChecks', () => {
    it('should pass all checks with valid ticket', () => {
      const result = (engine as any).preflightChecks(mockTicket);
      
      expect(result.shouldProcess).toBe(true);
      expect(result.reason).toBe('All checks passed');
    });

    it('should pass with exact mock ticket data', () => {
      const result = (engine as any).preflightChecks(mockTicket);
      expect(result.shouldProcess).toBe(true);
    });

    it('should fail when auto-response is disabled', () => {
      mockSettings.auto_response_enabled = false;
      engine = new TicketDeflectionEngine('user-1', mockSettings);
      
      const result = (engine as any).preflightChecks(mockTicket);
      
      expect(result.shouldProcess).toBe(false);
      expect(result.reason).toBe('Auto-response disabled');
    });

    it('should fail for excluded categories', () => {
      mockSettings.excluded_categories = ['account'];
      engine = new TicketDeflectionEngine('user-1', mockSettings);
      
      const result = (engine as any).preflightChecks(mockTicket);
      
      expect(result.shouldProcess).toBe(false);
      expect(result.reason).toBe('Category "account" is excluded');
    });

    it('should fail for escalation keywords', () => {
      mockTicket.content = 'This is urgent, I need help immediately!';
      
      const result = (engine as any).preflightChecks(mockTicket);
      
      expect(result.shouldProcess).toBe(false);
      expect(result.reason).toBe('Contains escalation keyword');
    });

    it('should fail for high priority tickets', () => {
      mockTicket.priority = 'priority';
      
      const result = (engine as any).preflightChecks(mockTicket);
      
      expect(result.shouldProcess).toBe(false);
      expect(result.reason).toBe('High priority ticket - human escalation required');
    });
  });

  describe('shouldAutoResolve', () => {
    it('should return true for high confidence responses', () => {
      const highConfidenceResponse: AIResponse = {
        response_content: 'Here is your solution',
        response_type: 'auto_resolve',
        confidence_score: 0.9,
        reasoning: 'Clear solution available',
        tokens_used: 100,
        cost_usd: 0.002
      };

      const result = (engine as any).shouldAutoResolve(highConfidenceResponse);
      expect(result).toBe(true);
    });

    it('should return false for low confidence responses', () => {
      const lowConfidenceResponse: AIResponse = {
        response_content: 'I think this might help',
        response_type: 'follow_up',
        confidence_score: 0.5,
        reasoning: 'Uncertain about solution',
        tokens_used: 100,
        cost_usd: 0.002
      };

      const result = (engine as any).shouldAutoResolve(lowConfidenceResponse);
      expect(result).toBe(false);
    });

    it('should work with exact mock values', () => {
      const mockResponse: AIResponse = {
        response_content: 'Here is how to reset your password...',
        response_type: 'auto_resolve',
        confidence_score: 0.9,
        reasoning: 'Clear password reset instructions available',
        tokens_used: 1000,
        cost_usd: 0.002
      };

      const result = (engine as any).shouldAutoResolve(mockResponse);
      expect(result).toBe(true);
    });
  });

  describe('isBusinessHours', () => {
    it('should return true during business hours', () => {
      // Mock current time to be during business hours (9 AM - 5 PM)
      const mockDate = new Date('2024-01-15T14:00:00Z'); // 2 PM
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      const result = (engine as any).isBusinessHours();
      expect(result).toBe(true);
      
      jest.restoreAllMocks();
    });

    it('should return false outside business hours', () => {
      // Mock current time to be outside business hours (8 PM)
      const mockDate = new Date('2024-01-15T20:00:00Z'); // 8 PM
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      const result = (engine as any).isBusinessHours();
      expect(result).toBe(false);
      
      jest.restoreAllMocks();
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost correctly', () => {
      const tokens = 1000;
      const result = (engine as any).calculateCost(tokens);
      
      // Expected cost: 1000 tokens * $0.000002 per token = $0.002
      expect(result).toBe(0.002);
    });

    it('should handle zero tokens', () => {
      const result = (engine as any).calculateCost(0);
      expect(result).toBe(0);
    });
  });

  describe('extractKeywords', () => {
    it('should extract meaningful keywords', () => {
      const text = 'How do I reset my password and change my email settings?';
      const result = (engine as any).extractKeywords(text);
      
      expect(result).toContain('reset');
      expect(result).toContain('password');
      expect(result).toContain('email');
      expect(result).toContain('settings');
    });

    it('should handle empty text', () => {
      const result = (engine as any).extractKeywords('');
      expect(result).toEqual([]);
    });

    it('should filter out common words', () => {
      const text = 'the and or but how do i reset password';
      const result = (engine as any).extractKeywords(text);
      
      expect(result).toContain('reset');
      expect(result).toContain('password');
      expect(result).not.toContain('the');
      expect(result).not.toContain('and');
    });
  });

  describe('processTicket', () => {
    it('should process ticket successfully with high confidence', async () => {
      // Mock OpenAI response with function calling format and usage
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            function_call: {
              name: 'generate_support_response',
              arguments: JSON.stringify({
                response_content: 'Here is how to reset your password...',
                response_type: 'auto_resolve',
                confidence_score: 0.9,
                reasoning: 'Clear password reset instructions available',
                tokens_used: 1000,
                cost_usd: 0.002
              })
            }
          }
        }],
        usage: { total_tokens: 1000 }
      });

      const result = await engine.processTicket(mockTicket);

      expect(result.shouldRespond).toBe(true);
      expect(result.response).toBeDefined();
      expect(result.response?.confidence_score).toBe(0.9);
      expect(result.reason).toBe('High confidence AI response generated');
    });

    it('minimal test - should work with basic setup', async () => {
      // Create minimal settings and ticket
      const minimalSettings: DeflectionSettings = {
        auto_response_enabled: true,
        confidence_threshold: 0.8,
        escalation_threshold: 0.6,
        response_language: 'en',
        business_hours_only: false,
        excluded_categories: [],
        escalation_keywords: [],
        custom_instructions: undefined
      };

      const minimalTicket: TicketData = {
        id: 'test-1',
        user_id: 'user-1',
        intercom_conversation_id: 'conv-1',
        content: 'How do I reset my password?',
        customer_email: 'test@example.com',
        created_at: new Date().toISOString()
      };

      const minimalEngine = new TicketDeflectionEngine('user-1', minimalSettings);

      // Mock OpenAI response
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            function_call: {
              name: 'generate_support_response',
              arguments: JSON.stringify({
                response_content: 'Here is how to reset your password...',
                response_type: 'auto_resolve',
                confidence_score: 0.9,
                reasoning: 'Clear password reset instructions available'
              })
            }
          }
        }],
        usage: { total_tokens: 1000 }
      });

      const result = await minimalEngine.processTicket(minimalTicket);
      expect(result.shouldRespond).toBe(true);
    });

    it('should not respond for low confidence', async () => {
      // Mock OpenAI response with low confidence and usage
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            function_call: {
              name: 'generate_support_response',
              arguments: JSON.stringify({
                response_content: 'I think this might help...',
                response_type: 'follow_up',
                confidence_score: 0.5,
                reasoning: 'Uncertain about the solution',
                tokens_used: 1000,
                cost_usd: 0.002
              })
            }
          }
        }],
        usage: { total_tokens: 1000 }
      });

      const result = await engine.processTicket(mockTicket);

      expect(result.shouldRespond).toBe(false);
      expect(result.reason).toContain('Low confidence');
    });

    it('should handle processing errors gracefully', async () => {
      // Mock OpenAI to throw an error
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const result = await engine.processTicket(mockTicket);

      expect(result.shouldRespond).toBe(false);
      expect(result.reason).toBe('API Error');
    });

    it('should skip processing when preflight checks fail', async () => {
      mockSettings.auto_response_enabled = false;
      engine = new TicketDeflectionEngine('user-1', mockSettings);

      const result = await engine.processTicket(mockTicket);

      expect(result.shouldRespond).toBe(false);
      expect(result.reason).toBe('Auto-response disabled');
    });
  });

  describe('generateResponse', () => {
    it('should generate response with correct structure', async () => {
      // Mock OpenAI response with function calling format and usage
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            function_call: {
              name: 'generate_support_response',
              arguments: JSON.stringify({
                response_content: 'Here is how to reset your password...',
                response_type: 'auto_resolve',
                confidence_score: 0.9,
                reasoning: 'Clear password reset instructions available'
              })
            }
          }
        }],
        usage: { total_tokens: 1000 }
      });

      const result = await (engine as any).generateResponse(mockTicket);
      expect(result.confidence_score).toBe(0.9);
      expect(result.response_type).toBe('auto_resolve');
    });
  });

  describe('getUserSettings', () => {
    it('should retrieve user settings successfully', async () => {
      const mockSettings = {
        auto_response_enabled: true,
        confidence_threshold: 0.8,
        escalation_threshold: 0.6,
        response_language: 'en',
        business_hours_only: false,
        excluded_categories: ['billing'],
        escalation_keywords: ['urgent'],
        custom_instructions: 'Be very helpful'
      };

      const mockSupabase = require('@/lib/supabase/client').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { deflection_settings: mockSettings },
          error: null
        })
      });

      const result = await TicketDeflectionEngine.getUserSettings('user-1');

      expect(result).toEqual(mockSettings);
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    it('should return default settings when user not found', async () => {
      const mockSupabase = require('@/lib/supabase/client').supabaseAdmin;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      });

      const result = await TicketDeflectionEngine.getUserSettings('nonexistent-user');

      expect(result.auto_response_enabled).toBe(true);
      expect(result.confidence_threshold).toBe(0.8);
      expect(result.response_language).toBe('en');
    });
  });
}); 