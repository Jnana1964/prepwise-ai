import pdfParse from 'pdf-parse';
import fs from 'fs/promises';

export async function extractTextFromPdf(filePath) {
  const buffer = await fs.readFile(filePath);
  const result = await pdfParse(buffer);
  return result.text;
}
