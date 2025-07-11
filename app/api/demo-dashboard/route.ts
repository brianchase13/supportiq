import { NextRequest, NextResponse } from 'next/server';
import { 
  mockDashboardMetrics,
  mockTicketTrends,
  mockCategoryBreakdown,
  mockSentimentAnalysis,
  mockTopIssues,
  mockAgentPerformance 
} from '@/lib/mock/mockData';

export async function GET(request: NextRequest) {
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json({
    success: true,
    data: {
      metrics: mockDashboardMetrics,
      trends: mockTicketTrends,
      categories: mockCategoryBreakdown,
      sentiment: mockSentimentAnalysis,
      topIssues: mockTopIssues,
      agents: mockAgentPerformance,
      lastUpdated: new Date().toISOString(),
    }
  });
}