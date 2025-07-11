import { NextRequest, NextResponse } from 'next/server';
import { mockBenchmarkData } from '@/lib/mock/mockData';

export async function GET(request: NextRequest) {
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 800));

  return NextResponse.json({
    success: true,
    data: mockBenchmarkData
  });
}