import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let sqlClient: NeonQueryFunction<false, false> | null = null;

/**
 * Returns connection string from environment.
 * Prefers DATABASE_URL, falls back to POSTGRES_URL or NEON_DATABASE_URL.
 */
export function getConnectionString(): string | null {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    null
  );
}

/**
 * Indicates whether a Neon Postgres database connection is configured.
 */
export function isDatabaseConfigured(): boolean {
  const url = getConnectionString();
  return !!url && url.startsWith('postgres');
}

/**
 * Gets or initializes the Neon serverless SQL query client.
 * Returns null if DATABASE_URL is not configured.
 */
export function getDb(): NeonQueryFunction<false, false> | null {
  if (sqlClient) return sqlClient;

  const connectionString = getConnectionString();
  if (!connectionString) return null;

  try {
    sqlClient = neon(connectionString);
    return sqlClient;
  } catch (err) {
    console.error('Failed to initialize Neon SQL client:', err);
    return null;
  }
}
