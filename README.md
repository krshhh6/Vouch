# 🛡️ Vouch — Zero-Knowledge Medical Leave Protocol

> **A research-grade selective-disclosure credential verifier that lets employees prove statutory leave eligibility to HR without exposing sensitive raw health reports, clinical diagnoses, or clinic names.**
> 
> GitHub: [tarunagnihotri534/Vouch](https://github.com/tarunagnihotri534/Vouch)

---

## 🔬 Research Gaps & Protocol Innovations

Vouch addresses specific, citable research gaps in selective disclosure and verifiable credentials:

| Research Gap | Conventional Limitation | Vouch Solution |
| :--- | :--- | :--- |
| **Metadata Leakage** *(FIX 0a & 0b)* | Clinic names (e.g. *"Sunrise Fertility"*) and sub-categories (e.g. *"surgery"*, *"mental-health"*) act as quasi-diagnoses. | Replaces clinic names with `issuerIsLicensed: true` and `issuerRefHash` (`sha256(regNo + salt)`). Public claims collapse to `CoarseCategory`: `STATUTORY_MATERNITY`, `STATUTORY_MEDICAL`, `CAREGIVING`, `SELF_DECLARED`. |
| **Episodic, Quota-Bound Entitlements** *(F1)* | VC literature focuses on static claims (*"age ≥ 18"*). Leave is recurring and drawn against statutory caps. | Pseudonymous Entitlement Ledger (`usr_hash`) evaluating **4 pass/fail predicate booleans** on verification. HR never sees remaining days or leave history. |
| **Power Asymmetry & Coercion** *(F2)* | Consent models assume free choice, ignoring manager coercion (*"just upload the full PDF"*). | **Constrained Request Builder**: HR cannot compose requests or request arbitrary documents. Verifier surface has zero file uploads or free-text fields. |
| **Auditability vs. Unlinkability** *(F3)* | Employers must satisfy labor inspectors without retaining protected health information (PHI). | **Tamper-Evident Hash Chain**: Append-only receipts (`sha256(prevHash + canonicalJSON(receipt))`) with jittered timestamps, chain integrity walker, and CSV export. |
| **Inference Side-Channels** *(F4)* | Timing and duration remain inference vectors (e.g. 26 weeks = maternity). | **Honest Leakage Meter**: Enumerates exact disclosed fields, models residual inferences, pads payloads to 1024 bytes, and applies timestamp jitter. |
| **No Legal-to-Claim Mapping** *(F5)* | No standard maps labor laws to minimum claims. | **Policy Compiler (`VOUCH-2026.1`)**: Runtime enforcement throwing if `forbiddenClaims` are present. Pure **self-declaration flow** for menstrual leave with zero clinician involvement. |
| **Paper-First Health Systems** *(F6)* | Clinics rely on physical certificates and stamps. | **Paper Fallback QR**: Printable certificate with signed P-256 payload QR + Issuer Revocation. |
| **Dispute Resolution Escape Hatch** *(F7)* | Zero data retention prevents arbitration in contested leaves. | **Dual-Consent Break-Glass**: Time-boxed unsealing requiring cryptographic co-signatures of both Grievance Officer and Employee. |
| **Demo Stage Weapon** *(F8)* | Hard to prove zero data is stored. | **`/hr/inspector`**: One-click live memory dump and automated token scan proving zero diagnoses exist in HR storage. |

---

## 🚀 Quick Start & Local Setup

### 1. Installation
```bash
# Clone repository and install dependencies
git clone https://github.com/tarunagnihotri534/Vouch.git
cd Vouch
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Privacy & Security Tests
```bash
npm test
```
Asserts 100% absence of prohibited clinical and clinic tokens across all HR payloads and validates policy compiler enforcement.

---

## 🧭 Complete Demo Tour (All Roles)

1. **🏥 Clinic Issuer (`/issuer`)**:
   - Issue a credential as Dr. Elena Rostova (*Summit Women's Health*).
   - Notice how clinical category (*"Pregnancy"*) auto-derives to coarse public class `STATUTORY_MATERNITY`.
   - Click **"Print Paper QR"** for offline paper-first workflow fallback.
2. **👤 Employee Vault (`/employee`)**:
   - View your credential with non-disclosed details in your private wallet.
   - Inspect **"Policy Quotas (F1 Ledger)"** to see remaining days (hidden from HR).
   - Test **"Self-Declared Menstrual Leave"** (1-click generation with zero doctor note).
   - Click **"Generate Selective Share Code"** and review the **`<LeakageMeter />`** before copying code `LG-7892`.
3. **🏢 Corporate HR Verifier (`/hr`)**:
   - Enter `LG-7892`.
   - Observe the **Constrained Request Notice**: *"This request is generated from policy VOUCH-2026.1 and cannot be widened."*
   - Verify the **4 Predicate Booleans** (Max Duration, Quota Quorum, Validity, No Double Dip).
   - Click **"Verify Chain Integrity"** and **"Export Auditor CSV"**.
4. **🔍 Database Inspector (`/hr/inspector`)**:
   - One click on stage to inspect the raw HR database memory dump.
   - Run the **Live Prohibited Token Scan** to prove zero medical strings exist in HR storage.

---

## 🏛️ Registry Architecture & NMC Integration Path

> **Registry Stub Honesty Note:**
> In this prototype, the trusted-issuer registry is initialized as a pre-seeded set of accredited healthcare providers (`src/lib/registry.ts`).
> In production deployment, this maps directly to the **National Medical Commission (NMC) National Register API** and state medical councils:
> - Doctors authenticate with their Digital Signature Certificate (DSC) or Aadhaar-linked e-Sign.
> - The verifier resolves public keys via DNS-based DID documents (`did:web:registry.nmc.org.in:doctors:<regNo>`) or decentralized trust registries (W3C DID).

---

## 📄 License
MIT License. Built for privacy-preserving labor standards and workplace dignity.
