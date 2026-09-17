import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env.local
const envPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  });
}

const sql = neon(process.env.DATABASE_URL);

async function test() {
  const issuers = await sql`SELECT count(*) as count FROM issuers`;
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  const sampleIssuers = await sql`SELECT reg_no, clinic_name, status FROM issuers LIMIT 3`;

  console.log('\n🟢 Live Neon Lakebase Postgres Status: CONNECTED');
  console.log('📦 Public Tables Created:', tables.map(t => t.table_name).join(', '));
  console.log('🩺 Seeded Issuers Count:', issuers[0].count);
  console.log('📋 Sample Clinical Issuers in Live DB:');
  console.table(sampleIssuers);
  console.log('');
}

test().catch(console.error);
