import crypto from 'crypto';

class IntercomClient {
  constructor() {
    this.clientId = process.env.INTERCOM_CLIENT_ID;
    this.clientSecret = process.env.INTERCOM_CLIENT_SECRET;
    this.webhookSecret = process.env.INTERCOM_WEBHOOK_SECRET;
    this.baseUrl = 'https://api.intercom.io';
  }

  // OAuth Methods
  getOAuthUrl(state = '') {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: process.env.INTERCOM_REDIRECT_URI,
      response_type: 'code',
      state: state
    });
    
    return `${this.baseUrl}/oauth?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    const response = await fetch(`${this.baseUrl}/auth/eagle/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // API Methods
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`Intercom API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Conversations
  async getConversations(accessToken, params = {}) {
    return this.makeRequest('/conversations', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params
    });
  }

  async getConversation(accessToken, conversationId) {
    return this.makeRequest(`/conversations/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  // Users
  async getUsers(accessToken, params = {}) {
    return this.makeRequest('/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params
    });
  }

  async getUser(accessToken, userId) {
    return this.makeRequest(`/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  // Admins
  async getAdmins(accessToken) {
    return this.makeRequest('/admins', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  // Tickets
  async getTickets(accessToken, params = {}) {
    return this.makeRequest('/tickets', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params
    });
  }

  async getTicket(accessToken, ticketId) {
    return this.makeRequest(`/tickets/${ticketId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  // Webhook Verification
  verifyWebhookSignature(payload, signature) {
    if (!this.webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  // Data Sync Methods for SupportIQ
  async syncConversations(accessToken, since = null) {
    const params = since ? { since } : {};
    const conversations = await this.getConversations(accessToken, params);
    
    // Transform for SupportIQ analytics
    return conversations.data.map(conv => ({
      id: conv.id,
      type: 'conversation',
      status: conv.state,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      user_id: conv.user?.id,
      admin_id: conv.assignee?.id,
      subject: conv.conversation_message?.subject,
      body: conv.conversation_message?.body,
      tags: conv.tags?.map(tag => tag.name) || [],
      priority: conv.priority,
      // SupportIQ specific fields
      deflection_score: this.calculateDeflectionScore(conv),
      sentiment: this.analyzeSentiment(conv.conversation_message?.body),
      category: this.categorizeConversation(conv)
    }));
  }

  async syncTickets(accessToken, since = null) {
    const params = since ? { since } : {};
    const tickets = await this.getTickets(accessToken, params);
    
    return tickets.data.map(ticket => ({
      id: ticket.id,
      type: 'ticket',
      status: ticket.state,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      user_id: ticket.user?.id,
      admin_id: ticket.assignee?.id,
      subject: ticket.ticket_attributes?.subject,
      body: ticket.ticket_attributes?.body,
      priority: ticket.ticket_attributes?.priority,
      // SupportIQ specific fields
      deflection_score: this.calculateDeflectionScore(ticket),
      sentiment: this.analyzeSentiment(ticket.ticket_attributes?.body),
      category: this.categorizeTicket(ticket)
    }));
  }

  // SupportIQ Analytics Methods
  calculateDeflectionScore(item) {
    // Simple scoring based on conversation/ticket characteristics
    let score = 0;
    
    if (item.tags?.some(tag => tag.name?.toLowerCase().includes('faq'))) score += 0.3;
    if (item.tags?.some(tag => tag.name?.toLowerCase().includes('documentation'))) score += 0.2;
    if (item.priority === 'low') score += 0.1;
    if (item.state === 'closed' && item.updated_at - item.created_at < 3600) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  analyzeSentiment(text) {
    if (!text) return 'neutral';
    
    const positiveWords = ['great', 'good', 'excellent', 'amazing', 'love', 'thanks', 'thank you'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'frustrated', 'angry', 'disappointed'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  categorizeConversation(conversation) {
    const text = conversation.conversation_message?.body?.toLowerCase() || '';
    
    if (text.includes('password') || text.includes('login')) return 'authentication';
    if (text.includes('billing') || text.includes('payment')) return 'billing';
    if (text.includes('bug') || text.includes('error')) return 'technical';
    if (text.includes('feature') || text.includes('request')) return 'feature_request';
    
    return 'general';
  }

  categorizeTicket(ticket) {
    const text = ticket.ticket_attributes?.body?.toLowerCase() || '';
    
    if (text.includes('password') || text.includes('login')) return 'authentication';
    if (text.includes('billing') || text.includes('payment')) return 'billing';
    if (text.includes('bug') || text.includes('error')) return 'technical';
    if (text.includes('feature') || text.includes('request')) return 'feature_request';
    
    return 'general';
  }
}

export default IntercomClient; 