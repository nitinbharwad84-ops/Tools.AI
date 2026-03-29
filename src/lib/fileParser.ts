import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker source for pdfjs-dist
// Using unpkg as it provides the exact versioned files from npm
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const parsePdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

export const parseDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

export const parseFile = async (file: File): Promise<string> => {
  if (file.type === 'text/plain') {
    return await file.text();
  } else if (file.type === 'application/pdf') {
    return await parsePdf(file);
  } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
    if (file.name.endsWith('.doc')) {
      throw new Error('Legacy .doc files are not supported. Please convert to .docx or .txt.');
    }
    return await parseDocx(file);
  } else {
    throw new Error('Unsupported file type.');
  }
};
