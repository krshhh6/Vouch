import { IssuerIdentity } from './types';

// Pre-seeded list of accredited medical issuers in the Trusted Clinic Registry
export const TRUSTED_ISSUERS: IssuerIdentity[] = [
  {
    id: 'clinic-summit-wh',
    name: 'Summit Women’s Health & Reproductive Medicine',
    doctorName: 'Dr. Elena Rostova, MD, FACOG',
    regNumber: 'GMC-8849201',
    specialty: 'Obstetrics, Gynecology & Reproductive Health',
    isRegistered: true,
    location: 'Building B, Suite 400, Metro Medical Center',
    // Pre-generated JWK representation for demo trust anchors
    publicKeyJwk: {
      kty: "EC",
      crv: "P-256",
      x: "f83OJ3D2xFmTbKEBaGJ43uGuCDbPHT19SnlecFsKNAc",
      y: "x_da7WsqKZPuyOMEgSF8aWJa6Af85h0U2xIN558vpxU",
      ext: true
    },
    publicKeyHex: "3059301306072a8648ce3d020106082a8648ce3d030107034200047fcdce2770f6c459b36ca101686278dee1be0836cf1d3d7d4a795e705b0a3407c7f75aed6b2a2993eecce30481217c69625ae807fce61d14db120de79f2fa715"
  },
  {
    id: 'clinic-st-jude',
    name: 'St. Jude Regional Medical Center',
    doctorName: 'Dr. Aris Thorne, MD, FACS',
    regNumber: 'GMC-9120448',
    specialty: 'General Surgery & Post-Operative Recovery',
    isRegistered: true,
    location: '100 Mercy Way, Sector 4',
    publicKeyJwk: {
      kty: "EC",
      crv: "P-256",
      x: "W98pXkXq0cK8pQ0qX1p2m3n4o5p6q7r8s9t0u1v2w3x",
      y: "y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t",
      ext: true
    },
    publicKeyHex: "3059301306072a8648ce3d020106082a8648ce3d030107034200045bdf295e45ead1c2bca50d2a5f59676e6e768b9185a06e9f1a0e1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff001122334455667"
  },
  {
    id: 'clinic-metro-mind',
    name: 'Metro Behavioral Health & Neuro-Wellness',
    doctorName: 'Dr. Marcus Vance, PsyD, MD',
    regNumber: 'GMC-7731904',
    specialty: 'Clinical Psychiatry & Occupational Mental Health',
    isRegistered: true,
    location: '88 Westview Terrace, Suite 12',
    publicKeyJwk: {
      kty: "EC",
      crv: "P-256",
      x: "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2",
      y: "3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4",
      ext: true
    },
    publicKeyHex: "3059301306072a8648ce3d020106082a8648ce3d03010703420004d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6"
  }
];

export function getIssuerById(id: string): IssuerIdentity | undefined {
  return TRUSTED_ISSUERS.find(i => i.id === id);
}

export function isIssuerInRegistry(regNumber: string): { isTrusted: boolean; issuer?: IssuerIdentity } {
  const issuer = TRUSTED_ISSUERS.find(i => i.regNumber.toLowerCase() === regNumber.toLowerCase());
  return {
    isTrusted: !!issuer,
    issuer
  };
}
