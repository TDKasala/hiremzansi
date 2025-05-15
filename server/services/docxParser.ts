import mammoth from 'mammoth';

/**
 * Extract text content from a DOCX buffer
 * @param buffer The DOCX file as a buffer
 * @returns The extracted text content
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    console.log("Attempting to extract text from DOCX using mammoth");
    
    // Try using mammoth to extract text from the DOCX file
    const result = await mammoth.extractRawText({ buffer });
    
    if (result && result.value && result.value.trim().length > 100) {
      console.log("Successfully extracted text from DOCX");
      return result.value.trim();
    }
    
    // Mammoth didn't return substantial content, try alternative methods
    console.warn("Mammoth extraction returned insufficient content, trying another approach");
    
    // Try using mammoth to extract HTML and then strip tags
    const htmlResult = await mammoth.convertToHtml({ buffer });
    
    if (htmlResult && htmlResult.value && htmlResult.value.length > 100) {
      console.log("Extracted HTML content, stripping tags");
      // Simple HTML tag stripping
      const textContent = htmlResult.value
        .replace(/<[^>]*>/g, ' ') // Replace HTML tags with spaces
        .replace(/\s+/g, ' ')     // Normalize whitespace
        .trim();
        
      if (textContent.length > 100) {
        console.log("Successfully extracted text from HTML conversion");
        return textContent;
      }
    }
    
    // If all extraction attempts fail, use the fallback
    console.warn("All extraction methods failed, using fallback");
    return await fallbackExtractFromDOCX(buffer);
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    console.warn('Using fallback extraction method');
    return await fallbackExtractFromDOCX(buffer);
  }
}

// Fallback function for when standard extraction fails
export async function fallbackExtractFromDOCX(buffer: Buffer): Promise<string> {
  console.warn('Using fallback DOCX extraction method');
  
  try {
    // DOCX files are basically ZIP archives containing XML files
    // We'll attempt a very basic content scan for text strings
    const content = buffer.toString('utf8');
    
    // Try to find text content that might be in the DOCX's XML
    const textMatches = content.match(/>([^<]{5,})</g);
    
    if (textMatches && textMatches.length > 0) {
      // Clean up the matched text
      const extractedText = textMatches
        .map(match => match.replace(/[><]/g, '').trim())
        .filter(text => text.length > 5)
        .join('\n');
        
      if (extractedText.length > 100) {
        console.log("Successfully extracted some text with fallback method");
        return extractedText;
      }
    }
    
    // If text extraction failed completely, provide an informative message
    const message = `
This document appears to be a DOCX file of approximately ${Math.round(buffer.length / 1024)} KB.
The system was unable to properly extract the text content from this document.

Please consider:
1. Ensuring the document contains proper text content (not just images)
2. Saving the document in a different format or using a different word processor
3. Making sure the document isn't password protected or corrupted

The ATS system processing your application may face similar challenges with this document.
For best results, use a simple document format with clean text content.
`;

    console.log("Returning informative fallback message");
    return message;
  } catch (error) {
    console.error('Fallback DOCX extraction failed:', error);
    throw new Error('Failed to extract text from DOCX file. Please check the document format and try again.');
  }
}
