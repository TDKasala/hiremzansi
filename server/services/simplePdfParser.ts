/**
 * Simple PDF Parser Service with OCR Support
 * 
 * This service provides PDF text extraction for CV analysis with OCR support
 * using Tesseract.js when needed
 */

import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';

/**
 * Extract text from PDF buffer using multiple approaches for reliability
 * 
 * @param pdfBuffer PDF file buffer
 * @returns Extracted text content
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log("Starting enhanced PDF text extraction");
    
    // First attempt: Try pdf-parse extraction
    let extractedText = "";
    try {
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData.text || "";
      console.log("PDF-parse extraction completed with text length:", extractedText.length);
    } catch (pdfError) {
      console.error("PDF-parse extraction failed:", pdfError);
    }
    
    // Second attempt: If pdf-parse failed or returned too little text, try simpler extraction
    if (extractedText.length < 500) {
      console.log("PDF-parse extraction insufficient, trying alternative extraction");
      
      // Simple text extraction from buffer
      const simpleExtractedText = pdfBuffer.toString('utf-8')
        .replace(/[^\x20-\x7E\r\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // If simple extraction looks better, use it
      if (simpleExtractedText.length > extractedText.length && 
          hasProperTextContent(simpleExtractedText)) {
        extractedText = simpleExtractedText;
        console.log("Using alternative extraction with text length:", extractedText.length);
      }
    }
    
    // Final attempt: If both methods failed, try OCR
    if (extractedText.length < 500 || !hasProperTextContent(extractedText)) {
      console.log("Text extraction insufficient, attempting OCR");
      try {
        const ocrText = await extractTextWithOCR(pdfBuffer);
        
        // Only use OCR result if it's better than what we have
        if (ocrText.length > extractedText.length) {
          extractedText = ocrText;
          console.log("Using OCR extracted text with length:", extractedText.length);
        }
      } catch (ocrError) {
        console.error("OCR extraction failed:", ocrError);
        // Continue with what we have if OCR fails
      }
    }
    
    // Process and clean the extracted text
    return processExtractedText(extractedText);
    
  } catch (error: any) {
    console.error("All PDF extraction methods failed:", error);
    return "Content extraction failed. For best results, please upload a PDF with selectable text.";
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