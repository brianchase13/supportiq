import { subDays, subHours, subMinutes } from 'date-fns';

export interface Ticket {
  id: string;
  subject: string;
  category: 'Bug' | 'Feature Request' | 'How-to' | 'Billing';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  responseTime: number; // in minutes
  satisfaction: number; // 1-5
  sentiment: 'positive' | 'neutral' | 'negative';
  agentId: string;
  customerId: string;
  customerEmail: string;
  messages: number;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  totalTickets: number;
  avgResponseTime: number;
  satisfactionScore: number;
  status: 'online' | 'offline' | 'busy';
}

export interface DailyStats {
  date: Date;
  totalTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  satisfactionScore: number;
}

// Support agents
export const agents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Sarah Chen',
    avatar: 'SC',
    totalTickets: 342,
    avgResponseTime: 15,
    satisfactionScore: 4.8,
    status: 'online'
  },
  {
    id: 'agent-2',
    name: 'Michael Rodriguez',
    avatar: 'MR',
    totalTickets: 289,
    avgResponseTime: 22,
    satisfactionScore: 4.6,
    status: 'online'
  },
  {
    id: 'agent-3',
    name: 'Emma Thompson',
    avatar: 'ET',
    totalTickets: 315,
    avgResponseTime: 18,
    satisfactionScore: 4.9,
    status: 'busy'
  },
  {
    id: 'agent-4',
    name: 'David Kim',
    avatar: 'DK',
    totalTickets: 276,
    avgResponseTime: 25,
    satisfactionScore: 4.5,
    status: 'offline'
  },
  {
    id: 'agent-5',
    name: 'Jessica Williams',
    avatar: 'JW',
    totalTickets: 298,
    avgResponseTime: 20,
    satisfactionScore: 4.7,
    status: 'online'
  }
];

// Common ticket subjects by category
const ticketSubjects = {
  Bug: [
    'Login button not working',
    'Dashboard loading slowly',
    'Export feature crashes',
    'Data not saving correctly',
    'Error 500 on checkout',
    'Mobile app crashing',
    'Notifications not working',
    'Search returning wrong results'
  ],
  'Feature Request': [
    'Add dark mode',
    'Bulk export functionality',
    'Custom report builder',
    'API webhook support',
    'Two-factor authentication',
    'Team collaboration features',
    'Advanced filtering options',
    'Integration with Slack'
  ],
  'How-to': [
    'How to reset password?',
    'Setting up integrations',
    'Customizing dashboard',
    'Managing team permissions',
    'Exporting data to CSV',
    'Creating custom reports',
    'Using the API',
    'Billing cycle questions'
  ],
  Billing: [
    'Update payment method',
    'Cancel subscription',
    'Upgrade to Pro plan',
    'Invoice request',
    'Refund request',
    'Billing cycle question',
    'Apply discount code',
    'Payment failed'
  ]
};

// Generate random tickets
function generateTicket(index: number, daysAgo: number): Ticket {
  const categories: Array<'Bug' | 'Feature Request' | 'How-to' | 'Billing'> = ['Bug', 'Feature Request', 'How-to', 'Billing'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const subjects = ticketSubjects[category];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  
  const agent = agents[Math.floor(Math.random() * agents.length)];
  const responseTime = Math.floor(Math.random() * 90) + 5; // 5-95 minutes
  const satisfaction = Math.floor(Math.random() * 3) + 3; // 3-5 rating (skewed positive)
  
  // Determine sentiment based on category and satisfaction
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (satisfaction >= 4) sentiment = 'positive';
  else if (satisfaction <= 2) sentiment = 'negative';
  
  const statuses: Array<'open' | 'in_progress' | 'resolved' | 'closed'> = ['open', 'in_progress', 'resolved', 'closed'];
  const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent'];
  
  return {
    id: `ticket-${index}`,
    subject,
    category,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    createdAt: subMinutes(subDays(new Date(), daysAgo), Math.floor(Math.random() * 1440)),
    responseTime,
    satisfaction,
    sentiment,
    agentId: agent.id,
    customerId: `customer-${Math.floor(Math.random() * 1000)}`,
    customerEmail: `user${Math.floor(Math.random() * 1000)}@example.com`,
    messages: Math.floor(Math.random() * 5) + 1
  };
}

// Generate 30 days of tickets
export const tickets: Ticket[] = [];
let ticketIndex = 0;

for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
  const ticketsPerDay = Math.floor(Math.random() * 30) + 20; // 20-50 tickets per day
  for (let i = 0; i < ticketsPerDay; i++) {
    tickets.push(generateTicket(ticketIndex++, daysAgo));
  }
}

// Generate daily stats
export const dailyStats: DailyStats[] = [];
for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
  const date = subDays(new Date(), daysAgo);
  const dayTickets = tickets.filter(t => 
    t.createdAt.toDateString() === date.toDateString()
  );
  
  dailyStats.push({
    date,
    totalTickets: dayTickets.length,
    resolvedTickets: dayTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
    avgResponseTime: Math.round(dayTickets.reduce((sum, t) => sum + t.responseTime, 0) / dayTickets.length) || 0,
    satisfactionScore: Math.round(dayTickets.reduce((sum, t) => sum + t.satisfaction, 0) / dayTickets.length * 10) / 10 || 0
  });
}

// Calculate overall stats
export const overallStats = {
  totalTickets: tickets.length,
  openTickets: tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
  avgResponseTime: Math.round(tickets.reduce((sum, t) => sum + t.responseTime, 0) / tickets.length),
  satisfactionScore: Math.round(tickets.reduce((sum, t) => sum + t.satisfaction, 0) / tickets.length * 10) / 10,
  ticketsByCategory: {
    Bug: tickets.filter(t => t.category === 'Bug').length,
    'Feature Request': tickets.filter(t => t.category === 'Feature Request').length,
    'How-to': tickets.filter(t => t.category === 'How-to').length,
    Billing: tickets.filter(t => t.category === 'Billing').length
  },
  sentimentBreakdown: {
    positive: tickets.filter(t => t.sentiment === 'positive').length,
    neutral: tickets.filter(t => t.sentiment === 'neutral').length,
    negative: tickets.filter(t => t.sentiment === 'negative').length
  }
};

// Top issues (most common subjects)
const subjectCounts = tickets.reduce((acc, ticket) => {
  acc[ticket.subject] = (acc[ticket.subject] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

export const topIssues = Object.entries(subjectCounts)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .map(([subject, count]) => ({ subject, count }));