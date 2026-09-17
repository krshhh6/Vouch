import { NextResponse } from 'next/server';
import { initializeDatabaseSchema } from '@/lib/db/init';
import { isDatabaseConfigured, getConnectionString } from '@/lib/db/neon';

export async function GET() {
  const configured = isDatabaseConfigured();
  const conn = getConnectionString();
  const maskedConn = conn ? conn.replace(/:([^:@]+)@/, ':****@') : null;

  return NextResponse.json({
    status: configured ? 'CONFIGURED' : 'NOT_CONFIGURED',
    engine: 'Neon Lakebase Postgres',
    driver: '@neondatabase/serverless',
    connectionString: maskedConn,
    instructions: configured
      ? 'Database URL is present. Send POST /api/db/init to run schema DDL and seeds.'
      : 'Set DATABASE_URL in your environment or .env.local file to connect to your Neon project.',
  });
}

export async function POST() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: 'DATABASE_URL is not configured in your environment or .env.local.',
        engine: 'Neon Lakebase Postgres',
      },
      { status: 400 }
    );
  }

  const result = await initializeDatabaseSchema();
  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
