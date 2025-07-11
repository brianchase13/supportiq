import { NextRequest, NextResponse } from 'next/server';
import { 
  mockDeflectionOpportunities, 
  mockTicketsAnalyzed, 
  mockTotalSavings, 
  mockMonthlySavings 
} from '@/lib/mock/mockData';

export async function GET(request: NextRequest) {
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        totalTicketsAnalyzed: mockTicketsAnalyzed,
        totalSavingsIdentified: mockTotalSavings,
        monthlySavingsOpportunity: mockMonthlySavings,
        averageTicketCost: 23.50,
        deflectionPotential: 68,
      },
      opportunities: mockDeflectionOpportunities,
      generatedAt: new Date().toISOString(),
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mock processing of user data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return NextResponse.json({
      success: true,
      message: 'Analysis completed',
      data: {
        summary: {
          totalTicketsAnalyzed: mockTicketsAnalyzed,
          totalSavingsIdentified: mockTotalSavings,
          monthlySavingsOpportunity: mockMonthlySavings,
        },
        opportunities: mockDeflectionOpportunities,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process analysis' },
      { status: 500 }
    );
  }
}