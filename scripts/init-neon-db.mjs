import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to read .env or .env.local if not loaded
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.substring(0, idx).trim();
          const value = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  }
}

loadEnv();

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

console.log('\n======================================================');
console.log('--- VOUCH NEON LAKEBASE POSTGRES INITIALIZER ---');
console.log('======================================================\n');

if (!dbUrl) {
  console.log('⚠️  DATABASE_URL is not set in environment or .env.local.');
  console.log('👉 To connect your Neon project:');
  console.log('   1. Copy your pooled connection string from Neon Console (https://console.neon.tech)');
  console.log('   2. Add it to .env.local:');
  console.log('      DATABASE_URL="postgres://user:password@ep-cool-branch-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"');
  console.log('   3. Re-run: node scripts/init-neon-db.mjs\n');
  process.exit(0);
}

const masked = dbUrl.replace(/:([^:@]+)@/, ':****@');
console.log(`📡 Connecting to Neon database: ${masked}\n`);

async function run() {
  try {
    const sql = neon(dbUrl);

    console.log('🔨 Executing schema DDL and table creations...');

    await sql`
      CREATE TABLE IF NOT EXISTS issuers (
        issuer_ref_hash VARCHAR(128) PRIMARY KEY,
        reg_no VARCHAR(64) NOT NULL,
        clinic_name VARCHAR(256) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
        added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        revoked_at TIMESTAMP WITH TIME ZONE
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_issuers_status ON issuers(status)`;

    await sql`
      CREATE TABLE IF NOT EXISTS share_codes (
        code VARCHAR(64) PRIMARY KEY,
        attestation_id VARCHAR(128) NOT NULL,
        policy_version VARCHAR(64) NOT NULL,
        policy_rule_id VARCHAR(64) NOT NULL,
        hr_payload JSONB NOT NULL,
        signed_attestation JSONB,
        is_revoked BOOLEAN DEFAULT FALSE,
        view_count INTEGER DEFAULT 0,
        padded_byte_length INTEGER DEFAULT 1024,
        intended_recipient VARCHAR(256),
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS receipts (
        id VARCHAR(128) PRIMARY KEY,
        share_code_ref VARCHAR(64) NOT NULL,
        policy_version VARCHAR(64),
        verified_at TIMESTAMP WITH TIME ZONE NOT NULL,
        outcome VARCHAR(32) NOT NULL,
        proof_hash VARCHAR(128) NOT NULL,
        predicate_result JSONB,
        prev_hash VARCHAR(128) NOT NULL,
        hash VARCHAR(128) NOT NULL,
        reason TEXT,
        actor_role VARCHAR(64) DEFAULT 'HR_BENEFITS_VERIFIER',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_receipts_share_code ON receipts(share_code_ref)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_receipts_verified_at ON receipts(verified_at)`;

    await sql`
      CREATE TABLE IF NOT EXISTS entitlements (
        employer_pseudonym VARCHAR(128) NOT NULL,
        coarse_category VARCHAR(64) NOT NULL,
        days_entitled_annual INTEGER NOT NULL,
        days_taken_ytd INTEGER NOT NULL DEFAULT 0,
        approved_ranges JSONB DEFAULT '[]'::jsonb,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (employer_pseudonym, coarse_category)
      )
    `;

    console.log('🌱 Seeding clinical trust anchors...');

    await sql`
      INSERT INTO issuers (issuer_ref_hash, reg_no, clinic_name, status)
      VALUES 
        ('sha256_abc123', '12345NMC', 'Sunrise Medical & Reproductive Health', 'ACTIVE'),
        ('sha256_xyz789', '54321NMC', 'Central Regional Hospital', 'REVOKED'),
        ('hash_abc123', '12345NMC', 'Dr. A - Summit Health Clinic', 'ACTIVE'),
        ('hash_xyz789', '99999NMC', 'Dr. B - Discredited Provider', 'REVOKED'),
        ('35d799009dfd2dff6f9f592ad69ec4ef9081e6b81a2da382902ea9a0a14da956', 'GMC-8849201', 'Summit Women’s Health & Reproductive Medicine', 'ACTIVE'),
        ('0d0322c349ddfb65147575dfa3d3c82e666a416b0dfd6a5da671f16503cba26b', 'GMC-9120448', 'St. Jude Regional Medical Center', 'ACTIVE'),
        ('433be54a1be7534484b9015c9ff802f0672e0d37e735492d5c8e31fc5772390a', 'GMC-7731904', 'Metro Behavioral Health & Neuro-Wellness', 'ACTIVE')
      ON CONFLICT (issuer_ref_hash) DO NOTHING
    `;

    console.log('✨ Neon Postgres schema initialized successfully!\n');
  } catch (err) {
    console.error('❌ Failed to initialize Neon database:', err.message);
    process.exit(1);
  }
}

run();
