import { RedactionEntity } from './types';

export interface SampleMedicalDocument {
  id: string;
  title: string;
  category: string;
  patientName: string;
  doctorName: string;
  clinic: string;
  rawText: string;
  description: string;
}

export const SAMPLE_DOCUMENTS: SampleMedicalDocument[] = [
  {
    id: 'pregnancy-ivf',
    title: 'High-Risk Early Pregnancy / IVF Follow-up',
    category: 'pregnancy',
    patientName: 'Sarah Jenkins',
    doctorName: 'Dr. Elena Rostova, MD, FACOG',
    clinic: 'Summit Women’s Health & Reproductive Medicine',
    description: 'Contains sensitive IVF cycle notes, hormone therapy, and early 8-week gestation details that an employee would NOT want to reveal to HR.',
    rawText: `CLINICAL CONSULTATION & ATTENDANCE NOTE
Date: September 15, 2026
Patient: Sarah Jenkins (DOB: 14/04/1992 | MRN: #W-90218)
Physician: Dr. Elena Rostova, MD (Medical Council Reg: GMC-8849201)
Facility: Summit Women’s Health & Reproductive Medicine

CHIEF COMPLAINT & DIAGNOSIS:
Patient presents at 7 weeks 4 days gestation following successful In Vitro Fertilization (IVF-ICSI Cycle #3) with donor embryo. Primary diagnosis: Threatened Miscarriage (ICD-10: O20.0) with acute Hyperemesis Gravidarum (ICD-10: O21.0).

CLINICAL FINDINGS & LAB RESULTS:
- Transvaginal Ultrasound: Intrauterine gestational sac present with subchorionic hematoma measuring 1.8cm x 0.9cm.
- Beta-hCG: 38,400 mIU/mL (appropriate progression).
- Serum Progesterone: 18.2 ng/mL.
- Patient experiencing debilitating nausea, severe dehydration, and pelvic cramping.

PRESCRIBED MEDICATIONS & REGIMEN:
1. Progesterone 200mg vaginal suppositories twice daily.
2. Ondansetron (Zofran) 4mg ODT Q8H PRN for emesis.
3. Prenatal vitamins with high-dose methylfolate 1000mcg.
4. IV Hydration (Normal Saline 1000mL with multivitamins) administered in clinic.

OCCUPATIONAL ASSESSMENT & CERTIFICATION:
Due to active subchorionic bleeding and severe hyperemesis, patient is medically unfit for work duties and must observe strict pelvic and bed rest. 

LEAVE RECOMMENDATION:
Certified unfit for work duty from September 16, 2026 through October 07, 2026. Anticipated return to modified duty on October 08, 2026.

Dr. Elena Rostova, MD, FACOG
Summit Women's Health`
  },
  {
    id: 'mental-health-burnout',
    title: 'Acute Psychiatric Assessment & Anxiety Protocol',
    category: 'mental-health',
    patientName: 'Alex Morgan',
    doctorName: 'Dr. Marcus Vance, PsyD, MD',
    clinic: 'Metro Behavioral Health & Neuro-Wellness',
    description: 'Contains deeply private psychiatric evaluation, SSRI prescription changes, and panic disorder diagnoses.',
    rawText: `METRO BEHAVIORAL HEALTH & NEURO-WELLNESS
Psychiatric Evaluation & Medical Leave Certificate
Date: September 12, 2026
Patient: Alex Morgan | Ref ID: #PSY-44019
Attending: Dr. Marcus Vance, MD (Reg: GMC-7731904)

DIAGNOSTIC IMPRESSION:
Major Depressive Disorder, Single Episode, Severe without Psychotic Features (ICD-10: F32.2) and Generalized Panic Disorder with Agoraphobia (ICD-10: F41.0).

CLINICAL SUMMARY:
Patient presented with severe emotional exhaustion, cognitive brain fog, panic attacks occurring 3-4 times weekly, and persistent sleep disturbances related to prolonged occupational trauma. PHQ-9 Score: 19 (Severe Depression); GAD-7 Score: 18 (Severe Anxiety).

PHARMACOTHERAPY & CARE PLAN:
1. Initiated Escitalopram (Lexapro) 10mg PO daily, titrating to 20mg in 14 days.
2. Clonazepam 0.5mg PO PRN for acute panic spikes (max 2 tabs/day).
3. Bi-weekly Cognitive Behavioral Therapy (CBT) and intensive outpatient trauma therapy.

FITNESS FOR WORK DIRECTIVE:
Patient is experiencing severe acute impairment in executive functioning, memory retention, and emotional regulation. Complete medical leave of absence is essential for neural decompression and psychiatric stabilization.

MANDATED LEAVE WINDOW:
September 14, 2026 through October 14, 2026.
Re-evaluation scheduled for October 10, 2026 prior to duty resumption.

Dr. Marcus Vance, MD
Metro Behavioral Health`
  },
  {
    id: 'surgical-recovery',
    title: 'Orthopedic Spine Surgery & Post-Op Discharge',
    category: 'surgery',
    patientName: 'David Chen',
    doctorName: 'Dr. Aris Thorne, MD, FACS',
    clinic: 'St. Jude Regional Medical Center',
    description: 'Contains invasive surgical details, narcotic pain management, and physical limitations.',
    rawText: `ST. JUDE REGIONAL MEDICAL CENTER
Department of Neurosurgery & Orthopedic Spine
Surgical Discharge Summary & Medical Leave Authorization
Date: September 10, 2026
Patient: David Chen | MRN: #SURG-88120

OPERATIVE PROCEDURE & DIAGNOSIS:
L4-L5 Microscopic Lumbar Discectomy and Neural Decompression (ICD-10: M51.26). Post-operative status post-lumbar radiculopathy and herniated nucleus pulposus.

POST-OPERATIVE FINDINGS:
- Incision healing appropriately with surgical staples in situ.
- Lower extremity neurological deficit resolving; bilateral straight leg raise test improved.
- Moderate post-surgical inflammation and paraspinal muscle spasms.

DISCHARGE MEDICATIONS:
1. Oxycodone-Acetaminophen 5-325mg PO Q6H PRN for acute surgical pain (5-day supply).
2. Cyclobenzaprine 10mg PO TID for severe muscle spasm.
3. Cefazolin 500mg PO BID prophylactic antibiotic for 7 days.
4. Enoxaparin (Lovenox) 40mg SubQ daily for DVT prophylaxis.

WORK RESTRICTIONS & LEAVE AUTHORIZATION:
Patient is prohibited from prolonged sitting (>15 mins), lifting objects >5 lbs, or driving. Complete medical leave is mandatory.

LEAVE PERIOD:
Certified Leave: September 11, 2026 to October 23, 2026.
Expected return to desk duty (with ergonomic sit-stand desk accommodation) on October 24, 2026.

Dr. Aris Thorne, MD, FACS
St. Jude Regional Medical Center`
  }
];

// Clinical dictionary and regex patterns for automated redaction detection
const REDACTION_RULES: Array<{
  pattern: RegExp;
  type: RedactionEntity['type'];
  reason: string;
}> = [
  // ICD-10 Codes (e.g., ICD-10: O20.0, F32.2, M51.26)
  {
    pattern: /(?:ICD-10(?:\s*Code)?[:\s]+)?\b[A-TV-Z][0-9][0-9AB](?:\.[0-9A-TV-Z]{1,4})?\b/gi,
    type: 'icd_code',
    reason: 'Specific ICD-10 diagnostic billing code reveals exact medical classification'
  },
  // Diagnoses & Clinical Conditions
  {
    pattern: /\b(?:In Vitro Fertilization|IVF-ICSI|IVF|Threatened Miscarriage|Hyperemesis Gravidarum|Subchorionic [hH]ematoma|Major Depressive Disorder|Depression|Panic Disorder|Agoraphobia|Bipolar(?: [I|II])?|Lumbar Discectomy|Radiculopathy|Herniated [dD]isc|Carcinoma|Neoplasm|Chemotherapy|Endometriosis|Ectopic Pregnancy|Schizophrenia|Post-Traumatic Stress|PTSD|HIV|Hepatitis|Epilepsy|Tumor|Biopsy|Suicidal ideation)\b/gi,
    type: 'diagnosis',
    reason: 'Direct diagnostic terminology reveals highly sensitive medical condition'
  },
  // Medications & Dosages
  {
    pattern: /\b(?:Progesterone|Ondansetron|Zofran|Escitalopram|Lexapro|Clonazepam|Klonopin|Oxycodone(?:-Acetaminophen)?|Percocet|Cyclobenzaprine|Cefazolin|Enoxaparin|Lovenox|Sertraline|Zoloft|Fluoxetine|Prozac|Alprazolam|Xanax|Methotrexate|Insulin|Prednisone|Morphine|Tramadol|Adderall|Ritalin)\b(?:\s+\d+(?:\.\d+)?\s*(?:mg|mcg|mL|g|ODT|PO|SubQ|units|tabs|suppositories)?(?:\s+(?:daily|BID|TID|QID|Q8H|Q6H|PRN|twice daily|weekly))?)?/gi,
    type: 'medication',
    reason: 'Prescription drug name and dosage expose treatment regimen and condition severity'
  },
  // Lab values, Gestational age, test scores
  {
    pattern: /\b(?:Beta-hCG|hCG|PHQ-9|GAD-7|Serum Progesterone|Transvaginal Ultrasound|WBC|ALT|AST|TSH|MRI|CT Scan|EEG|Blood Pressure|Biopsy findings|Gestational sac|Straight leg raise)[\s\w:\-=><.,\/#\(\)]*?(?=\n|\.|$)/gi,
    type: 'lab_value',
    reason: 'Specific lab metrics, test scores, or scan measurements reveal clinical trajectory'
  },
  // Specific gestation / surgical details
  {
    pattern: /\b(?:\d+\s+weeks(?:\s+\d+\s+days)?\s+gestation|donor embryo|pelvic cramping|acute bleeding|surgical staples|straight leg raise|trauma therapy|emotional exhaustion|panic attacks occurring \d+-\d+ times)\b/gi,
    type: 'personal_vitals',
    reason: 'Intimate physiological details and symptoms that present workplace bias risks'
  }
];

export function analyzeAndRedactText(text: string): {
  entities: RedactionEntity[];
  redactedText: string;
  stats: {
    totalEntities: number;
    diagnosisCount: number;
    medicationCount: number;
    icdCodeCount: number;
    labCount: number;
    estimatedPrivacyExposurePercent: number;
  };
} {
  const entities: RedactionEntity[] = [];
  const coveredRanges: Array<{ start: number; end: number }> = [];

  // Helper to check overlap
  const isOverlapping = (start: number, end: number) => {
    return coveredRanges.some(r => Math.max(start, r.start) < Math.min(end, r.end));
  };

  REDACTION_RULES.forEach((rule, ruleIdx) => {
    // Reset regex state
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matchText = match[0].trim();
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length;

      if (matchText.length > 2 && !isOverlapping(startIndex, endIndex)) {
        coveredRanges.push({ start: startIndex, end: endIndex });
        entities.push({
          id: `entity-${ruleIdx}-${startIndex}`,
          text: matchText,
          type: rule.type,
          reason: rule.reason,
          startIndex,
          endIndex
        });
      }
    }
  });

  // Sort entities by startIndex ascending
  entities.sort((a, b) => a.startIndex - b.startIndex);

  // Generate redacted version with [████████]
  let redactedText = '';
  let lastIndex = 0;

  entities.forEach(ent => {
    redactedText += text.substring(lastIndex, ent.startIndex);
    redactedText += `[REDACTED: ${ent.type.toUpperCase()}]`;
    lastIndex = ent.endIndex;
  });
  redactedText += text.substring(lastIndex);

  const stats = {
    totalEntities: entities.length,
    diagnosisCount: entities.filter(e => e.type === 'diagnosis').length,
    medicationCount: entities.filter(e => e.type === 'medication').length,
    icdCodeCount: entities.filter(e => e.type === 'icd_code').length,
    labCount: entities.filter(e => e.type === 'lab_value' || e.type === 'personal_vitals').length,
    estimatedPrivacyExposurePercent: Math.min(100, Math.round((entities.length * 14.5)))
  };

  return { entities, redactedText, stats };
}
