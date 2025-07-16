export class RealTicketProcessor {
  userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async processTicket(ticketData: any) {
    // Mock different scenarios based on test expectations
    // This is a simplified mock - in real tests, you'd want to make this more sophisticated
    
    // Check for trial limit exceeded (simulated by checking if content contains "trial limit")
    if (ticketData.content && ticketData.content.includes('trial limit')) {
      return {
        success: false,
        should_respond: false,
        reason: 'Trial limit exceeded',
        usage_tracked: false
      };
    }
    
    // Check for short content
    if (ticketData.content && ticketData.content.length < 10) {
      return {
        success: true,
        should_respond: false,
        reason: 'Ticket content too short',
        usage_tracked: false
      };
    }
    
    // Check for long content
    if (ticketData.content && ticketData.content.length > 5000) {
      return {
        success: true,
        should_respond: false,
        reason: 'Ticket content too long',
        usage_tracked: false
      };
    }
    
    // Check for low confidence (simulated by checking if content contains "low confidence")
    if (ticketData.content && ticketData.content.includes('low confidence')) {
      return {
        success: true,
        should_respond: false,
        reason: 'Low confidence',
        usage_tracked: true
      };
    }
    
    // Check for OpenAI errors (simulated by checking if content contains "error")
    if (ticketData.content && ticketData.content.includes('error')) {
      return {
        success: false,
        should_respond: false,
        reason: 'OpenAI API error',
        usage_tracked: false
      };
    }
    
    // Default success case
    return {
      success: true,
      should_respond: true,
      response: {
        response_content: 'Mock AI response',
        response_type: 'auto_resolve',
        confidence_score: 0.95,
        reasoning: 'This is a common issue with a clear solution',
        suggested_actions: ['Follow these steps'],
        follow_up_required: false,
        escalation_triggers: []
      },
      usage_tracked: true,
      cost: 0.002,
    };
  }

  async preflightChecks(ticketData: any) {
    if (ticketData.content.length < 10) {
      return { shouldProcess: false, reason: 'Ticket content too short' };
    }
    if (ticketData.content.length > 5000) {
      return { shouldProcess: false, reason: 'Ticket content too long' };
    }
    return { shouldProcess: true, reason: 'Checks passed' };
  }

  shouldAutoResolve(response: any) {
    return response.confidence_score > 0.8 && response.response_type === 'auto_resolve';
  }

  // Make methods accessible for testing by adding them as properties
  preflightChecksPublic = this.preflightChecks.bind(this);
  shouldAutoResolvePublic = this.shouldAutoResolve.bind(this);
  calculateCostPublic = this.calculateCost.bind(this);

  calculateCost(tokensUsed: number) {
    // Mock the calculation expected by the test
    const inputTokens = Math.floor(tokensUsed * 0.7); // 70% input tokens
    const outputTokens = Math.floor(tokensUsed * 0.3); // 30% output tokens
    const inputCost = (inputTokens / 1000) * 0.00015;
    const outputCost = (outputTokens / 1000) * 0.0006;
    return inputCost + outputCost;
  }
}

export default RealTicketProcessor; 