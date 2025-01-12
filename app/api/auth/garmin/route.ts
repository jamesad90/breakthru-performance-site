import { NextResponse } from 'next/server';

// Note: Garmin's API requires a commercial agreement and approval
// This is a placeholder for the Garmin Connect API integration
export async function GET() {
  return NextResponse.json({ 
    message: 'Garmin Connect integration requires a commercial agreement. Please contact Garmin for API access.' 
  }, { status: 501 });
}
