import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import ws from 'ws';

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configuring Neon for local development and tests (via local proxy)
if (process.env.NODE_ENV === 'development' || process.env.VITEST) {
  connectionString = 'postgres://postgres:postgres@db.localtest.me:5432/main';
  // Always route HTTP SQL over local proxy to avoid https:443 during tests
  neonConfig.fetchEndpoint = () => `http://db.localtest.me:4444/sql`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.wsProxy = () => `db.localtest.me:4444/v2`;
}
neonConfig.webSocketConstructor = ws;

const sql = neon(connectionString);

// Drizzle supports both HTTP and WebSocket clients. Choose the one that fits your needs:

// HTTP Client:
// - Best for serverless functions and Lambda environments
// - Ideal for stateless operations and quick queries
// - Lower overhead for single queries
// - Better for applications with sporadic database access
export const db = drizzleHttp({ client: sql });
