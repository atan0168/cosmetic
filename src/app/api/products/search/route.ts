import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Placeholder for search API endpoint
  // This will be implemented in task 4
  return NextResponse.json({ 
    message: 'Search API endpoint - to be implemented',
    products: [],
    total: 0
  })
}