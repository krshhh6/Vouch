/**
 * Redacts sensitive clinical entities, diagnoses, medications, dosages, and patient identifiers
 * from raw medical document text.
 */
export function redactMedicalReport(text: string): {
  original: string;
  redacted: string;
  redactionCount: number;
} {
  if (!text) {
    return {
      original: '',
      redacted: '',
      redactionCount: 0,
    };
  }

  // Clinical patterns to scrub
  const REDACT_PATTERNS: RegExp[] = [
    // Diagnoses (ICD-10 codes, e.g., O20.0, F32.2, M51.26)
    /([A-TV-Z]\d{2}(?:\.\d{1,4})?)/g,
    // Medication names (common, reproductive, psychiatric, and pain drugs)
    /(paracetamol|ibuprofen|metformin|omeprazole|amlodipine|atorvastatin|progesterone|ondansetron|zofran|escitalopram|lexapro|clonazepam|klonopin|oxycodone|percocet|cyclobenzaprine|cefazolin|enoxaparin|lovenox|sertraline|zoloft|fluoxetine|prozac|alprazolam|xanax|methotrexate|insulin|prednisone|morphine|tramadol)/gi,
    // Dosages (e.g., 200mg, 4mg, 1000mcg, 10ml, 2 tabs)
    /(\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|units?|tabs?|caps?|suppositories?))/gi,
    // Patient identifiers and MRN
    /(?:patient id|MRN|medical record number|Ref ID)[:\s]+#?[A-Za-z0-9-]+/gi,
    // Specific clinical conditions & sensitive procedures
    /(?:In Vitro Fertilization|IVF-ICSI|IVF|Threatened Miscarriage|Hyperemesis Gravidarum|Subchorionic [hH]ematoma|Major Depressive Disorder|Panic Disorder|Agoraphobia|Lumbar Discectomy|Radiculopathy|Ectopic Pregnancy|Ultrasound|Beta-hCG)/gi,
  ];

  let redacted = text;
  let redactionCount = 0;

  REDACT_PATTERNS.forEach((pattern) => {
    const matches = redacted.match(pattern) || [];
    redactionCount += matches.length;
    redacted = redacted.replace(pattern, '[REDACTED]');
  });

  return {
    original: text,
    redacted,
    redactionCount,
  };
}
