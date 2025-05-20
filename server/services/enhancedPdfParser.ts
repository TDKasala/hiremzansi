/**
 * Enhanced PDF Parser Service
 * 
 * This service provides improved PDF text extraction for CV analysis
 * using pdf-parse and tesseract.js for OCR when needed
 */

import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

/**
 * Extract text from PDF buffer using enhanced techniques
 * 
 * @param pdfBuffer PDF file buffer
 * @returns Extracted text content
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("Starting enhanced PDF text extraction");
    
    // First attempt: use pdf-parse for text layer extraction
    const result = await pdfParse(pdfBuffer, {
      // Increase max pages for larger documents
      max: 50
    });
    
    let extractedText = result.text;
    
    // If text content is too short or empty, it might be a scanned PDF
    if (!extractedText || extractedText.trim().length < 200) {
      console.log("PDF appears to be scanned or has limited text layer, attempting OCR");
      // Use Tesseract OCR for image-based content
      extractedText = await extractTextWithOCR(pdfBuffer);
    }
    
    // Process the extracted text
    return processExtractedText(extractedText);
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extract text from PDF using OCR for scanned documents
 * 
 * @param pdfBuffer PDF file buffer
 * @returns OCR extracted text
 */
async function extractTextWithOCR(pdfBuffer: Buffer): Promise<string> {
  try {
    // For a production environment, you would convert the PDF to images first
    // This is a simplified approach for demo purposes
    
    console.log("Starting OCR text extraction with Tesseract.js");
    
    // Initialize Tesseract worker with English language
    const worker = await Tesseract.createWorker('eng');
    
    // Recognize text from PDF converted to image
    // This is simplified - in production, you would use a PDF-to-image converter first
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
  
  // Remove common PDF artifacts
  processed = processed
    .replace(/^Page \d+ of \d+$/gm, '')
    .replace(/^\d+$/gm, '')
    .replace(/\[?[0-9]+\]?/g, ' ')
    .replace(/\s{2,}/g, ' ');
  
  return processed;
}

/**
 * Test PDF extraction quality
 * 
 * @param pdfBuffer PDF file buffer
 * @returns Extraction quality statistics
 */
export async function testExtractionQuality(pdfBuffer: Buffer): Promise<{
  extractedText: string;
  characterCount: number;
  lineCount: number;
  wordCount: number;
  estimatedQuality: string;
}> {
  const extractedText = await extractTextFromPDF(pdfBuffer);
  const characterCount = extractedText.length;
  const lineCount = extractedText.split('\n').length;
  const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
  
  // Estimate quality based on word count and density
  let estimatedQuality = "Unknown";
  if (wordCount > 300) {
    estimatedQuality = "Good";
  } else if (wordCount > 100) {
    estimatedQuality = "Fair";
  } else {
    estimatedQuality = "Poor";
  }
  
  return {
    extractedText: extractedText.substring(0, 500) + "...", // Limited preview
    characterCount,
    lineCount,
    wordCount,
    estimatedQuality
  };
}

export default {
  extractTextFromPDF,
  testExtractionQuality
};