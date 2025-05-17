import jsPDF from 'jspdf';
import 'jspdf-autotable';

// A simplified PDF generator for ATS reports
export const generateATSReport = async (data: {
  score: number;
  strengths: string[];
  improvements: string[];
  issues: string[];
  cvName?: string;
  userName?: string;
  saKeywordsFound?: string[];
  saContextScore?: number;
  keywordRecommendations?: string[][];
}): Promise<Blob> => {
  // Create PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;
  
  // Title and header
  doc.setFontSize(22);
  doc.setTextColor(33, 33, 33);
  doc.text('ATS Compatibility Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  
  if (data.cvName) {
    doc.setFontSize(14);
    doc.text(`CV: ${data.cvName}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
  }
  
  if (data.userName) {
    doc.setFontSize(12);
    doc.text(`For: ${data.userName}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
  }
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - margin, 10, { align: 'right' });
  
  // Add score section
  yPos += 10;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 20, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text('ATS Compatibility Score:', margin + 5, yPos + 8);
  
  // Score
  const scoreText = `${data.score}%`;
  doc.setFontSize(16);
  
  // Set color based on score
  if (data.score >= 80) {
    doc.setTextColor(46, 125, 50); // Green
  } else if (data.score >= 60) {
    doc.setTextColor(255, 153, 0); // Amber
  } else {
    doc.setTextColor(211, 47, 47); // Red
  }
  
  doc.text(scoreText, pageWidth - margin - 5, yPos + 8, { align: 'right' });
  
  // Score interpretation
  let scoreInterpretation = '';
  if (data.score >= 80) {
    scoreInterpretation = 'Excellent - Your CV is highly optimized for ATS systems';
  } else if (data.score >= 60) {
    scoreInterpretation = 'Good - Your CV performs well but has room for improvement';
  } else {
    scoreInterpretation = 'Needs Improvement - Your CV requires significant optimization';
  }
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(scoreInterpretation, margin + 5, yPos + 15);
  yPos += 30;
  
  // Strengths section
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text('Key Strengths', margin, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  data.strengths.forEach((strength, index) => {
    doc.text(`• ${strength}`, margin + 5, yPos);
    yPos += 7;
  });
  
  yPos += 5;
  
  // Improvements section
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text('Areas for Improvement', margin, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  data.improvements.forEach((improvement, index) => {
    doc.text(`• ${improvement}`, margin + 5, yPos);
    yPos += 7;
  });
  
  // Critical issues (if any)
  if (data.issues && data.issues.length > 0) {
    yPos += 5;
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Critical Issues', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    data.issues.forEach((issue, index) => {
      doc.text(`• ${issue}`, margin + 5, yPos);
      yPos += 7;
    });
  }
  
  // South African Context (if provided)
  if (data.saContextScore !== undefined && data.saKeywordsFound && data.saKeywordsFound.length > 0) {
    yPos += 5;
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('South African Context Analysis', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    doc.text(`Your South African context score: ${data.saContextScore}%`, margin + 5, yPos);
    yPos += 7;
    
    doc.text('South African keywords found:', margin + 5, yPos);
    yPos += 7;
    
    let keywordLine = '';
    data.saKeywordsFound.forEach((keyword, index) => {
      if (keywordLine.length + keyword.length > 70) {
        doc.text(keywordLine, margin + 5, yPos);
        yPos += 7;
        keywordLine = '';
      }
      keywordLine += (keywordLine ? ', ' : '') + keyword;
    });
    
    if (keywordLine) {
      doc.text(keywordLine, margin + 5, yPos);
      yPos += 7;
    }
  }
  
  // Keyword recommendations (if provided)
  if (data.keywordRecommendations && data.keywordRecommendations.length > 0) {
    yPos += 5;
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Keyword Recommendations', margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    data.keywordRecommendations.forEach(([keyword, implementation], index) => {
      doc.text(`• ${keyword}: ${implementation}`, margin + 5, yPos);
      yPos += 7;
    });
  }
  
  // Add footer
  const footerText = 'ATSBoost - South African CV Optimization Platform - www.atsboost.co.za';
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  
  // Return the PDF as a blob
  return doc.output('blob');
};

/**
 * Download PDF blob with a specific filename
 */
export const downloadPDF = (pdfBlob: Blob, filename: string) => {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};