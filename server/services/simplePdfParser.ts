/**
 * Simple PDF Parser Service with OCR Support
 * 
 * This service provides PDF text extraction for CV analysis with OCR support
 * using Tesseract.js when needed
 */

import Tesseract from 'tesseract.js';

/**
 * Extract text from PDF buffer
 * 
 * @param pdfBuffer PDF file buffer
 * @returns Extracted text content
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("Starting simple PDF text extraction");
    
    // For PDF text extraction, we'll use a simplified approach
    // Extract text directly from buffer
    let extractedText = pdfBuffer.toString('utf-8');
    
    // Remove binary content and get only readable text
    extractedText = extractedText
      .replace(/[^\x20-\x7E\r\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // If the extracted text is too short or doesn't look like proper content,
    // attempt OCR extraction
    if (extractedText.length < 500 || !hasProperTextContent(extractedText)) {
      console.log("PDF appears to be scanned or has limited text layer, attempting OCR");
      extractedText = await extractTextWithOCR(pdfBuffer);
    }
    
    // Process and clean the extracted text
    return processExtractedText(extractedText);
    
  } catch (error: any) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Check if the extracted text appears to have proper content
 * 
 * @param text Extracted text to check
 * @returns Boolean indicating if text appears to be proper content
 */
function hasProperTextContent(text: string): boolean {
  // Check for common CV section headers
  const cvSectionHeaders = [
    'experience', 'education', 'skills', 'profile', 'summary', 'objective',
    'work', 'employment', 'qualifications', 'projects', 'references'
  ];
  
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Check if at least 2 section headers are present
  const foundHeaders = cvSectionHeaders.filter(header => lowerText.includes(header));
  
  return foundHeaders.length >= 2;
}

/**
 * Extract text from PDF using OCR
 * 
 * @param pdfBuffer PDF file buffer
 * @returns OCR extracted text
 */
async function extractTextWithOCR(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("Starting OCR text extraction with Tesseract.js");
    
    // Initialize Tesseract worker with English language
    const worker = await Tesseract.createWorker('eng');
    
    // Recognize text from the buffer
    const { data } = await worker.recognize(pdfBuffer);
    
    // Terminate the worker
    await worker.terminate();
    
    return data.text;
  } catch (error) {
    console.error("OCR extraction failed:", error);
    return "OCR text extraction failed. Please upload a PDF with text content.";
  }
}

/**
 * Process and clean up extracted text
 * 
 * @param text Raw extracted text
 * @returns Processed text
 */
function processExtractedText(text: string): string {
  if (!text) return "";
  
  // Remove excessive whitespace and normalize line breaks
  let processed = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
  
  return processed;
}

export default {
  extractTextFromPDF
};