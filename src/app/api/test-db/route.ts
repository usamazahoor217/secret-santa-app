import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/test-db - Simple database verification route
export async function GET() {
  try {
    // 1. Raw ping query
    const pingResult = await prisma.$queryRaw<Array<{ ping: number }>>`SELECT 1 as ping`;
    
    // 2. Fetch table counts to prove live database communication
    const [groupsCount, participantsCount, assignmentsCount] = await Promise.all([
      prisma.group.count(),
      prisma.participant.count(),
      prisma.assignment.count(),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'Prisma is successfully connected to local MySQL database!',
        database: 'secretsanta',
        ping: pingResult,
        stats: {
          groupsCount,
          participantsCount,
          assignmentsCount,
        },
        connectionUrl: process.env.DATABASE_URL ? 'Configured (mysql://...)' : 'Not configured',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Could not connect to MySQL database.',
        error: error instanceof Error ? error.message : 'Unknown database error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
