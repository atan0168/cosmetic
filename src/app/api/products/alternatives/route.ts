import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Placeholder for alternatives API endpoint
  // This will be implemented in task 5
  return NextResponse.json({ 
    message: 'Alternatives API endpoint - to be implemented',
    alternatives: []
  })
}