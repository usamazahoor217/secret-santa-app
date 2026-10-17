import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL || '';
  const isConfigured = !!databaseUrl;

  try {
    // Attempt a lightweight raw ping query
    await prisma.$queryRaw`SELECT 1 as ping`;

    return NextResponse.json(
      {
        status: 'connected',
        provider: 'mysql',
        message: 'Successfully connected to MySQL database via Prisma ORM.',
        databaseUrlConfigured: isConfigured,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';

    return NextResponse.json(
      {
        status: 'offline',
        provider: 'mysql',
        message:
          'Prisma client initialized with MySQL provider. Local MySQL server is currently unreachable or offline.',
        databaseUrlConfigured: isConfigured,
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
