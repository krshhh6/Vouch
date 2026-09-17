-- ==========================================================
-- VOUCH PROTOCOL — NEON POSTGRES DATABASE SCHEMA
-- ==========================================================

-- 1. Trusted Clinical Registry (Issuers)
CREATE TABLE IF NOT EXISTS issuers (
  issuer_ref_hash VARCHAR(128) PRIMARY KEY,
  reg_no VARCHAR(64) NOT NULL,
  clinic_name VARCHAR(256) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_issuers_status ON issuers(status);

-- 2. Selective Disclosure Share Codes
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
);

CREATE INDEX IF NOT EXISTS idx_share_codes_attestation ON share_codes(attestation_id);

-- 3. Tamper-Evident Hash-Chained Receipt Ledger
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
);

CREATE INDEX IF NOT EXISTS idx_receipts_share_code ON receipts(share_code_ref);
CREATE INDEX IF NOT EXISTS idx_receipts_verified_at ON receipts(verified_at);

-- 4. F1: Entitlement Ledger (Keyed by Pseudonymous Employer Hashes)
CREATE TABLE IF NOT EXISTS entitlements (
  employer_pseudonym VARCHAR(128) NOT NULL,
  coarse_category VARCHAR(64) NOT NULL,
  days_entitled_annual INTEGER NOT NULL,
  days_taken_ytd INTEGER NOT NULL DEFAULT 0,
  approved_ranges JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (employer_pseudonym, coarse_category)
);

-- 5. F7: Dual-Consent Break-Glass Dispute Audit Store
CREATE TABLE IF NOT EXISTS break_glass_requests (
  id VARCHAR(128) PRIMARY KEY,
  share_code VARCHAR(64) NOT NULL,
  attestation_id VARCHAR(128) NOT NULL,
  reason TEXT NOT NULL,
  grievance_officer_name VARCHAR(256) NOT NULL,
  grievance_officer_signed BOOLEAN DEFAULT FALSE,
  grievance_officer_signature_time TIMESTAMP WITH TIME ZONE,
  employee_signed BOOLEAN DEFAULT FALSE,
  employee_signature_time TIMESTAMP WITH TIME ZONE,
  is_unsealed BOOLEAN DEFAULT FALSE,
  unsealed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  receipt_id VARCHAR(128),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================================
-- SEED INITIAL CLINICAL TRUST ANCHORS
-- ==========================================================

INSERT INTO issuers (issuer_ref_hash, reg_no, clinic_name, status, added_at)
VALUES 
  ('sha256_abc123', '12345NMC', 'Sunrise Medical & Reproductive Health', 'ACTIVE', '2026-01-01T00:00:00Z'),
  ('sha256_xyz789', '54321NMC', 'Central Regional Hospital', 'REVOKED', '2025-06-01T00:00:00Z'),
  ('hash_abc123', '12345NMC', 'Dr. A - Summit Health Clinic', 'ACTIVE', '2026-01-01T00:00:00Z'),
  ('hash_xyz789', '99999NMC', 'Dr. B - Discredited Provider', 'REVOKED', '2025-01-01T00:00:00Z'),
  ('35d799009dfd2dff6f9f592ad69ec4ef9081e6b81a2da382902ea9a0a14da956', 'GMC-8849201', 'Summit Women’s Health & Reproductive Medicine', 'ACTIVE', '2026-01-01T00:00:00Z'),
  ('0d0322c349ddfb65147575dfa3d3c82e666a416b0dfd6a5da671f16503cba26b', 'GMC-9120448', 'St. Jude Regional Medical Center', 'ACTIVE', '2026-01-01T00:00:00Z'),
  ('433be54a1be7534484b9015c9ff802f0672e0d37e735492d5c8e31fc5772390a', 'GMC-7731904', 'Metro Behavioral Health & Neuro-Wellness', 'ACTIVE', '2026-01-01T00:00:00Z')
ON CONFLICT (issuer_ref_hash) DO UPDATE 
SET status = EXCLUDED.status, clinic_name = EXCLUDED.clinic_name;

-- SEED DEMO ENTITLEMENT
INSERT INTO entitlements (employer_pseudonym, coarse_category, days_entitled_annual, days_taken_ytd, approved_ranges)
VALUES 
  ('usr_mock_emp', 'STATUTORY_MATERNITY', 182, 0, '[]'::jsonb),
  ('usr_mock_emp', 'STATUTORY_MEDICAL', 91, 14, '[{"start": "2026-02-01", "end": "2026-02-14", "receiptId": "rcpt_genesis"}]'::jsonb),
  ('usr_mock_emp', 'CAREGIVING', 30, 0, '[]'::jsonb),
  ('usr_mock_emp', 'SELF_DECLARED', 12, 2, '[]'::jsonb)
ON CONFLICT (employer_pseudonym, coarse_category) DO NOTHING;
