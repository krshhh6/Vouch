import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for browser execution if unconfigured
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;
  }
}

/**
 * Extracts raw textual content from an uploaded medical PDF file.
 * Compatible with browser File/Blob objects and Node.js ArrayBuffer/Uint8Array.
 */
export async function extractTextFromPDF(
  file: File | Blob | ArrayBuffer | Uint8Array
): Promise<string> {
  let dataBytes: Uint8Array;

  if (file instanceof Uint8Array) {
    dataBytes = file;
  } else if (file instanceof ArrayBuffer) {
    dataBytes = new Uint8Array(file);
  } else if (typeof (file as File).arrayBuffer === 'function') {
    const ab = await (file as File).arrayBuffer();
    dataBytes = new Uint8Array(ab);
  } else {
    throw new Error('Unsupported file input format for extractTextFromPDF');
  }

  // Load document using pdfjs-dist
  const loadingTask = pdfjsLib.getDocument({
    data: dataBytes,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => {
        if ('str' in item && typeof item.str === 'string') {
          return item.str;
        }
        return '';
      })
      .join(' ');

    fullText += pageText.trim() + '\n';
  }

  return fullText.trim();
}
