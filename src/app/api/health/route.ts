import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Check database connectivity
    const dbCheck = await db.select({ count: sql<number>`count(*)` }).from(products).limit(1);
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: true,
        recordCount: dbCheck[0]?.count || 0
      },
      uptime: process.uptime(),
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      },
      uptime: process.uptime(),
    };

    return NextResponse.json(healthStatus, { status: 503 });
  }
}