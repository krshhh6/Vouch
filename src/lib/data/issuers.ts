export interface IssuerRecord {
  issuerRefHash: string; // sha256(regNo + secret salt)
  regNo: string; // NMC / GMC registration number
  clinicName: string;
  status: 'ACTIVE' | 'REVOKED';
  addedAt: string;
  revokedAt: string | null;
}

export const TRUSTED_ISSUERS: IssuerRecord[] = [
  {
    issuerRefHash: 'sha256_abc123',
    regNo: '12345NMC',
    clinicName: 'Sunrise Medical & Reproductive Health',
    status: 'ACTIVE',
    addedAt: '2026-01-01T00:00:00Z',
    revokedAt: null,
  },
  {
    issuerRefHash: 'sha256_xyz789',
    regNo: '54321NMC',
    clinicName: 'Central Regional Hospital',
    status: 'REVOKED',
    addedAt: '2025-06-01T00:00:00Z',
    revokedAt: '2026-01-15T00:00:00Z',
  },
  {
    issuerRefHash: 'hash_abc123',
    regNo: '12345NMC',
    clinicName: 'Dr. A - Summit Health Clinic',
    status: 'ACTIVE',
    addedAt: '2026-01-01T00:00:00Z',
    revokedAt: null,
  },
  {
    issuerRefHash: 'hash_xyz789',
    regNo: '99999NMC',
    clinicName: 'Dr. B - Discredited Provider',
    status: 'REVOKED',
    addedAt: '2025-01-01T00:00:00Z',
    revokedAt: '2026-01-10T00:00:00Z',
  },
  {
    issuerRefHash: '35d799009dfd2dff6f9f592ad69ec4ef9081e6b81a2da382902ea9a0a14da956',
    regNo: 'GMC-8849201',
    clinicName: 'Summit Women’s Health & Reproductive Medicine',
    status: 'ACTIVE',
    addedAt: '2026-01-01T00:00:00Z',
    revokedAt: null,
  },
  {
    issuerRefHash: '0d0322c349ddfb65147575dfa3d3c82e666a416b0dfd6a5da671f16503cba26b',
    regNo: 'GMC-9120448',
    clinicName: 'St. Jude Regional Medical Center',
    status: 'ACTIVE',
    addedAt: '2026-01-01T00:00:00Z',
    revokedAt: null,
  },
  {
    issuerRefHash: '433be54a1be7534484b9015c9ff802f0672e0d37e735492d5c8e31fc5772390a',
    regNo: 'GMC-7731904',
    clinicName: 'Metro Behavioral Health & Neuro-Wellness',
    status: 'ACTIVE',
    addedAt: '2026-01-01T00:00:00Z',
    revokedAt: null,
  }
];

/**
 * Checks if the clinician or clinic issuer hash is registered and active
 */
export function isIssuerTrusted(issuerRefHash: string): boolean {
  if (!issuerRefHash) return false;
  const issuer = TRUSTED_ISSUERS.find((i) => i.issuerRefHash.toLowerCase() === issuerRefHash.toLowerCase());
  return issuer?.status === 'ACTIVE';
}

/**
 * Revokes an issuer in the registry by hash
 */
export function revokeIssuer(issuerRefHash: string): void {
  const issuer = TRUSTED_ISSUERS.find((i) => i.issuerRefHash.toLowerCase() === issuerRefHash.toLowerCase());
  if (issuer) {
    issuer.status = 'REVOKED';
    issuer.revokedAt = new Date().toISOString();
  }
}
