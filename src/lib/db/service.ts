import { getDb, isDatabaseConfigured } from './neon';
import { TRUSTED_ISSUERS, isIssuerTrusted, revokeIssuer } from '../data/issuers';
import { Receipt } from '../verification/receiptChain';

export interface DbShareCodeRecord {
  code: string;
  attestationId: string;
  policyVersion: string;
  policyRuleId: string;
  hrPayload: any;
  signedAttestation?: any;
  isRevoked: boolean;
  viewCount: number;
  paddedByteLength: number;
  intendedRecipient?: string;
  expiresAt?: string;
  createdAt: string;
}

/**
 * Checks issuer status against Neon database (if connected) or fallback registry.
 */
export async function dbIsIssuerTrusted(issuerRefHash: string): Promise<boolean> {
  if (!issuerRefHash) return false;

  if (isDatabaseConfigured()) {
    const sql = getDb();
    if (sql) {
      try {
        const rows = await sql`
          SELECT status FROM issuers 
          WHERE LOWER(issuer_ref_hash) = LOWER(${issuerRefHash})
          LIMIT 1
        `;
        if (rows && rows.length > 0) {
          return rows[0].status === 'ACTIVE';
        }
      } catch (err) {
        console.warn('Neon query error in dbIsIssuerTrusted, falling back to local registry:', err);
      }
    }
  }

  return isIssuerTrusted(issuerRefHash);
}

/**
 * Revokes issuer in Neon database (if connected) and local registry.
 */
export async function dbRevokeIssuer(issuerRefHash: string): Promise<void> {
  if (!issuerRefHash) return;

  if (isDatabaseConfigured()) {
    const sql = getDb();
    if (sql) {
      try {
        await sql`
          UPDATE issuers 
          SET status = 'REVOKED', revoked_at = NOW()
          WHERE LOWER(issuer_ref_hash) = LOWER(${issuerRefHash})
        `;
      } catch (err) {
        console.warn('Neon query error in dbRevokeIssuer:', err);
      }
    }
  }

  revokeIssuer(issuerRefHash);
}

/**
 * Saves a share code to Neon Postgres (if connected)
 */
export async function dbSaveShareCode(share: DbShareCodeRecord): Promise<void> {
  if (isDatabaseConfigured()) {
    const sql = getDb();
    if (sql) {
      try {
        await sql`
          INSERT INTO share_codes (
            code, attestation_id, policy_version, policy_rule_id, 
            hr_payload, signed_attestation, is_revoked, view_count, 
            padded_byte_length, intended_recipient, expires_at, created_at
          ) VALUES (
            ${share.code}, ${share.attestationId}, ${share.policyVersion}, ${share.policyRuleId},
            ${JSON.stringify(share.hrPayload)}, ${JSON.stringify(share.signedAttestation || {})},
            ${share.isRevoked}, ${share.viewCount}, ${share.paddedByteLength},
            ${share.intendedRecipient || null}, ${share.expiresAt || null}, ${share.createdAt}
          )
          ON CONFLICT (code) DO UPDATE SET
            is_revoked = EXCLUDED.is_revoked,
            view_count = EXCLUDED.view_count
        `;
        return;
      } catch (err) {
        console.warn('Neon save share code failed, proceeding with in-memory sync:', err);
      }
    }
  }
}

/**
 * Retrieves a share code from Neon Postgres (if connected)
 */
export async function dbGetShareCode(code: string): Promise<DbShareCodeRecord | null> {
  if (!code) return null;

  if (isDatabaseConfigured()) {
    const sql = getDb();
    if (sql) {
      try {
        const rows = await sql`
          SELECT * FROM share_codes 
          WHERE UPPER(code) = UPPER(${code.trim()})
          LIMIT 1
        `;
        if (rows && rows.length > 0) {
          const row = rows[0];
          return {
            code: row.code,
            attestationId: row.attestation_id,
            policyVersion: row.policy_version,
            policyRuleId: row.policy_rule_id,
            hrPayload: typeof row.hr_payload === 'string' ? JSON.parse(row.hr_payload) : row.hr_payload,
            signedAttestation: typeof row.signed_attestation === 'string' ? JSON.parse(row.signed_attestation) : row.signed_attestation,
            isRevoked: row.is_revoked,
            viewCount: row.view_count,
            paddedByteLength: row.padded_byte_length,
            intendedRecipient: row.intended_recipient,
            expiresAt: row.expires_at,
            createdAt: row.created_at,
          };
        }
      } catch (err) {
        console.warn('Neon get share code failed, checking fallback:', err);
      }
    }
  }

  return null;
}

/**
 * Persists a verification receipt into the Neon append-only ledger
 */
export async function dbSaveReceipt(receipt: Receipt): Promise<void> {
  if (isDatabaseConfigured()) {
    const sql = getDb();
    if (sql) {
      try {
        await sql`
          INSERT INTO receipts (
            id, share_code_ref, policy_version, verified_at,
            outcome, proof_hash, prev_hash, hash, reason
          ) VALUES (
            ${receipt.id}, ${receipt.shareCodeRef}, 'VOUCH-2026.1', ${receipt.verifiedAt},
            ${receipt.outcome}, ${receipt.proofHash}, ${receipt.prevHash}, ${receipt.hash},
            ${receipt.reason || null}
          )
          ON CONFLICT (id) DO NOTHING
        `;
      } catch (err) {
        console.warn('Neon save receipt failed:', err);
      }
    }
  }
}

/**
 * Retrieves receipts from Neon Postgres ledger
 */
export async function dbGetReceipts(): Promise<Receipt[]> {
  if (isDatabaseConfigured()) {
    const sql = getDb();
    if (sql) {
      try {
        const rows = await sql`
          SELECT id, share_code_ref as "shareCodeRef", verified_at as "verifiedAt",
                 outcome, proof_hash as "proofHash", prev_hash as "prevHash",
                 hash, reason
          FROM receipts
          ORDER BY verified_at ASC
        `;
        return rows as unknown as Receipt[];
      } catch (err) {
        console.warn('Neon get receipts failed:', err);
      }
    }
  }

  return [];
}
