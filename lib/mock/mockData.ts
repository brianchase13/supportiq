// Mock data for demo functionality
export const mockTicketsAnalyzed = 10247;
export const mockTotalSavings = 47291;
export const mockMonthlySavings = 3941;

export const mockDeflectionOpportunities = [
  {
    id: 'mock_1',
    title: 'Password Reset Instructions',
    description: 'Users struggling with password reset process',
    ticketCount: 1247,
    avgHandleTime: 12,
    monthlyCost: 1567,
    annualCost: 18804,
    deflectionPotential: 85,
    confidence: 94,
    priority: 'high',
    exampleQuestions: [
      'How do I reset my password?',
      'Password reset email not received',
      'Cannot access password reset link'
    ],
    recommendedAction: 'Create step-by-step password reset guide with screenshots',
    implementationDifficulty: 'easy',
    timeToImplement: '2 hours',
    expectedImpact: 'Reduce password-related tickets by 80%',
  },
  {
    id: 'mock_2',
    title: 'Billing Cycle Questions',
    description: 'Confusion about billing dates and charges',
    ticketCount: 892,
    avgHandleTime: 18,
    monthlyCost: 1124,
    annualCost: 13488,
    deflectionPotential: 78,
    confidence: 91,
    priority: 'high',
    exampleQuestions: [
      'When will I be charged next?',
      'Why was I charged twice?',
      'How to change billing date?'
    ],
    recommendedAction: 'Add billing FAQ and proactive billing notifications',
    implementationDifficulty: 'medium',
    timeToImplement: '4 hours',
    expectedImpact: 'Reduce billing inquiries by 75%',
  },
  {
    id: 'mock_3',
    title: 'API Integration Help',
    description: 'Developers need help with API implementation',
    ticketCount: 634,
    avgHandleTime: 35,
    monthlyCost: 892,
    annualCost: 10704,
    deflectionPotential: 65,
    confidence: 87,
    priority: 'medium',
    exampleQuestions: [
      'How to authenticate with the API?',
      'Rate limiting best practices',
      'Sample code for integration'
    ],
    recommendedAction: 'Create comprehensive API documentation with code examples',
    implementationDifficulty: 'medium',
    timeToImplement: '8 hours',
    expectedImpact: 'Reduce API support tickets by 70%',
  },
];

export const mockDashboardMetrics = {
  totalTickets: 1234,
  avgResponseTime: 18,
  satisfactionScore: 4.8,
  openTickets: 89,
  deflectionRate: 34,
  potentialSavings: 2841
};

export const mockTicketTrends = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    tickets: Math.floor(Math.random() * 20) + 30,
    resolved: Math.floor(Math.random() * 15) + 25,
  };
});

export const mockCategoryBreakdown = [
  { name: 'Account Issues', value: 28, tickets: 347 },
  { name: 'Billing Questions', value: 22, tickets: 271 },
  { name: 'Technical Support', value: 18, tickets: 222 },
  { name: 'Feature Requests', value: 12, tickets: 148 },
  { name: 'Bug Reports', value: 11, tickets: 136 },
  { name: 'Other', value: 9, tickets: 110 },
];

export const mockSentimentAnalysis = [
  { name: 'Positive', value: 45, color: '#10b981' },
  { name: 'Neutral', value: 35, color: '#6b7280' },
  { name: 'Negative', value: 20, color: '#ef4444' },
];

export const mockTopIssues = [
  {
    id: 1,
    issue: 'Password reset not working',
    count: 127,
    avgResolutionTime: '2.3 hours',
    impact: 'High',
    trend: 'up'
  },
  {
    id: 2,
    issue: 'Billing inquiry - charge timing',
    count: 89,
    avgResolutionTime: '1.8 hours',
    impact: 'Medium',
    trend: 'down'
  },
  {
    id: 3,
    issue: 'API rate limit questions',
    count: 67,
    avgResolutionTime: '3.1 hours',
    impact: 'High',
    trend: 'stable'
  },
  {
    id: 4,
    issue: 'Feature request - dark mode',
    count: 45,
    avgResolutionTime: '0.5 hours',
    impact: 'Low',
    trend: 'up'
  },
];

export const mockAgentPerformance = [
  {
    id: 1,
    name: 'Sarah Chen',
    avatar: 'SC',
    ticketsResolved: 156,
    avgResponseTime: '12 min',
    satisfactionScore: 4.9,
    efficiency: 94
  },
  {
    id: 2,
    name: 'Mike Johnson',
    avatar: 'MJ',
    ticketsResolved: 143,
    avgResponseTime: '15 min',
    satisfactionScore: 4.7,
    efficiency: 89
  },
  {
    id: 3,
    name: 'Alex Rivera',
    avatar: 'AR',
    ticketsResolved: 134,
    avgResponseTime: '18 min',
    satisfactionScore: 4.6,
    efficiency: 87
  },
  {
    id: 4,
    name: 'Emma Davis',
    avatar: 'ED',
    ticketsResolved: 128,
    avgResponseTime: '14 min',
    satisfactionScore: 4.8,
    efficiency: 91
  },
];

export const mockInsights = [
  {
    id: 1,
    category: 'Prevention',
    title: 'Create Password Reset Guide',
    description: 'A comprehensive guide could prevent 85% of password-related tickets',
    impact: 'High',
    effort: 'Low',
    savings: '$18,804/year',
    confidence: 94,
    timeToImplement: '2 hours',
    priority: 'high'
  },
  {
    id: 2,
    category: 'Efficiency',
    title: 'Automate Billing Responses',
    description: 'Template responses for common billing questions',
    impact: 'Medium',
    effort: 'Low',
    savings: '$13,488/year',
    confidence: 91,
    timeToImplement: '4 hours',
    priority: 'high'
  },
  {
    id: 3,
    category: 'Prevention',
    title: 'Expand API Documentation',
    description: 'Better docs with code examples could reduce developer support tickets',
    impact: 'High',
    effort: 'Medium',
    savings: '$10,704/year',
    confidence: 87,
    timeToImplement: '1 week',
    priority: 'medium'
  },
  {
    id: 4,
    category: 'Satisfaction',
    title: 'Proactive Error Notifications',
    description: 'Alert users before they encounter known issues',
    impact: 'Medium',
    effort: 'Medium',
    savings: '$8,400/year',
    confidence: 82,
    timeToImplement: '3 days',
    priority: 'medium'
  },
];

export const mockBenchmarkData = {
  industryPosition: {
    overallRank: 45,
    totalCompanies: 127,
    percentile: 65,
    strongestMetric: 'Customer Satisfaction',
    weakestMetric: 'Response Time',
    improvementFocus: 'Ticket Deflection',
  },
  metrics: {
    responseTime: {
      your: 18,
      industry: 24,
      top10: 12,
      trend: 'improving'
    },
    satisfaction: {
      your: 4.8,
      industry: 4.3,
      top10: 4.9,
      trend: 'stable'
    },
    deflectionRate: {
      your: 34,
      industry: 52,
      top10: 78,
      trend: 'needs improvement'
    },
    ticketVolume: {
      your: 1234,
      industry: 890,
      top10: 450,
      trend: 'above average'
    }
  },
  recommendations: [
    {
      title: 'Implement AI Chatbot',
      description: 'Could improve deflection rate by 25%',
      impact: 'High',
      effort: 'Medium',
      timeline: '2-3 months'
    },
    {
      title: 'Create Self-Service Portal',
      description: 'Allow customers to resolve common issues independently',
      impact: 'High',
      effort: 'High',
      timeline: '3-4 months'
    }
  ]
};