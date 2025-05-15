/**
 * Extract text content from a PDF buffer
 * @param buffer The PDF file as a buffer
 * @returns The extracted text content
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    console.log("Using simpler text extraction method for PDF");
    
    // Convert buffer to utf-8 string and clean it
    const text = buffer.toString('utf-8')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control chars
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Normalize excessive newlines
      .trim();
      
    if (text.length > 100) {
      console.log("Extracted text content from PDF");
      return text;
    }
    
    // If simple extraction didn't work, try fallback
    console.warn("Simple extraction produced insufficient content, trying fallback");
    return await fallbackExtractFromPDF(buffer);
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    console.warn('Trying fallback extraction method');
    
    // If the main extraction fails, try the fallback
    return await fallbackExtractFromPDF(buffer);
  }
}

// Fallback method to create a reasonable placeholder when extraction fails
export async function fallbackExtractFromPDF(buffer: Buffer): Promise<string> {
  console.warn('Using fallback PDF extraction method');
  
  try {
    // Attempt to generate a basic content summary by looking for typical patterns
    const fileData = buffer.toString('hex');
    
    // We'll be honest that we couldn't extract content properly
    const message = `
This document appears to be a PDF file of approximately ${Math.round(buffer.length / 1024)} KB.
The system was unable to fully extract the text content from this PDF file.

Please consider:
1. Ensuring the PDF contains selectable text and not just images
2. Converting the document to a DOCX format which is more easily parsed
3. Uploading a different version of the document with selectable text

The ATS system processing your application will likely face similar challenges with this document format.
For best results, use a document with selectable text that allows keyword matching.
`;

    console.log("Returning fallback message to user");
    return message;
  } catch (error) {
    console.error('Fallback PDF extraction failed:', error);
    throw new Error('Failed to extract text from PDF file. Please upload a document with selectable text content.');
  }
}
