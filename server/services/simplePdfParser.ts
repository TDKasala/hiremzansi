import fs from 'fs';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);
const readFileAsync = promisify(fs.readFile);

/**
 * Extracts text from a PDF file using a simple, reliable approach
 * This function serves as a fallback when other PDF parsing methods fail
 * 
 * @param filePath Path to the PDF file
 * @returns Extracted text from the PDF
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // First try using a basic extraction approach
    try {
      // Read first 5 pages only for quick processing
      const { stdout } = await exec(`pdftotext -f 1 -l 5 -layout "${filePath}" -`);
      
      if (stdout.trim().length > 100) {
        console.log('PDF text extracted successfully using pdftotext');
        return stdout;
      }
    } catch (err) {
      console.log('pdftotext extraction failed, trying fallback method');
    }
    
    // Fallback method - read raw binary and attempt to extract text
    const data = await readFileAsync(filePath);
    let text = data.toString('utf8', 0, data.length);
    
    // Clean up text by removing non-printable characters and decode some common PDF encodings
    text = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ')
               .replace(/\\(\d{3})/g, (match, octal) => String.fromCharCode(parseInt(octal, 8)))
               .replace(/\\n/g, '\n')
               .replace(/\\r/g, '\r')
               .replace(/\\t/g, '\t');
    
    // Extract text between common PDF text markers
    const textBlocks: string[] = [];
    
    // Look for PDF text objects
    const textMatches = text.match(/BT\s+([^]*)ET/g);
    if (textMatches && textMatches.length > 0) {
      textMatches.forEach(block => {
        // Extract text strings from PDF commands
        const stringMatches = block.match(/\(([^)]+)\)/g);
        if (stringMatches) {
          stringMatches.forEach(str => {
            textBlocks.push(str.replace(/^\(|\)$/g, ''));
          });
        }
      });
    }
    
    // If we found text blocks, join them
    if (textBlocks.length > 0) {
      return textBlocks.join(' ');
    }
    
    // Fallback to a simple filter of content between parentheses which often contains text in PDFs
    const parenMatches = text.match(/\(([^)]+)\)/g);
    if (parenMatches && parenMatches.length > 0) {
      return parenMatches
        .map(m => m.replace(/^\(|\)$/g, ''))
        .filter(s => s.length > 3)  // Filter out very short strings
        .join(' ');
    }
    
    // Worst case, return whatever text we have after cleaning
    const cleanedText = text
      .replace(/[\x00-\x1F\x7F-\xFF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
      
    if (cleanedText.length > 100) {
      return cleanedText;
    }
    
    // If all else fails, return a message
    return "PDF text extraction failed. This PDF may be image-based or heavily encrypted. Please try a different file format.";
  } catch (error) {
    console.error('Error in PDF text extraction:', error);
    return "PDF text extraction error. Please try uploading in another format.";
  }
}