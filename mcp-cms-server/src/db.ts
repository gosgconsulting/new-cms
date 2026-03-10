import { Pool, type QueryResult, type QueryResultRow } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL environment variable is not set. ' +
        'Please set it to your PostgreSQL connection string: ' +
        'postgresql://user:password@host:port/database'
      );
    }

    const isLocalhost =
      connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1') ||
      connectionString.includes('::1');

    pool = new Pool({
      connectionString,
      ...(isLocalhost ? {} : { ssl: { rejectUnauthorized: false } }),
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: isLocalhost ? 30000 : 10000,
    });

    pool.on('error', (err) => {
      process.stderr.write(`[DB] Pool error: ${err.message}\n`);
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  const client = await getPool().connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
