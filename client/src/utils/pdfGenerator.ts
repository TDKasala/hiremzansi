import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

// This is a workaround for TypeScript
// @ts-ignore
const jsPDFWithAutoTable = jsPDF;

interface ReportSection {
  title: string;
  content: string | string[];
  type?: 'text' | 'list' | 'table';
  tableHeaders?: string[];
  tableData?: string[][];
}

interface ReportData {
  title: string;
  subtitle?: string;
  date: string;
  username?: string;
  sections: ReportSection[];
  score?: number;
  recommendations?: string[];
  footerText?: string;
  companyLogo?: string;
}

/**
 * Generate PDF report from CV analysis data
 */
export const generateATSReport = async (data: ReportData): Promise<Blob> => {
  // Create a new PDF document
  const doc = new jsPDFWithAutoTable('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // Add header with logo
  if (data.companyLogo) {
    try {
      doc.addImage(data.companyLogo, 'PNG', margin, 10, 40, 15);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(33, 33, 33);
  doc.text(data.title, pageWidth / 2, 20, { align: 'center' });
  
  // Subtitle
  if (data.subtitle) {
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(data.subtitle, pageWidth / 2, 28, { align: 'center' });
  }
  
  // Date and user
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const dateText = `Generated on: ${data.date}`;
  doc.text(dateText, pageWidth - margin, 10, { align: 'right' });
  
  if (data.username) {
    doc.text(`For: ${data.username}`, pageWidth - margin, 15, { align: 'right' });
  }
  
  // Add ATS score if provided
  if (data.score !== undefined) {
    let yPos = 40;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 20, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('ATS Compatibility Score:', margin + 5, yPos + 8);
    
    // Draw score
    const scoreText = `${data.score}%`;
    doc.setFontSize(16);
    if (data.score >= 80) {
      doc.setTextColor(46, 125, 50); // Green for high scores
    } else if (data.score >= 60) {
      doc.setTextColor(255, 153, 0); // Amber for medium scores
    } else {
      doc.setTextColor(211, 47, 47); // Red for low scores
    }
    doc.text(scoreText, pageWidth - margin - 5, yPos + 8, { align: 'right' });
    
    // Add score interpretation
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
    
    yPos += 25; // Move position down for next content
    
    // Content sections
    for (const section of data.sections) {
      // Check if we need a new page
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }
      
      // Section title
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text(section.title, margin, yPos);
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      yPos += 10;
      
      // Section content
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      if (section.type === 'list' && Array.isArray(section.content)) {
        section.content.forEach((item, index) => {
          // Check if we need a new page
          if (yPos > pageHeight - 30) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(`• ${item}`, margin + 5, yPos);
          yPos += 7;
        });
      } else if (section.type === 'table' && section.tableHeaders && section.tableData) {
        // Create table
        // @ts-ignore - jspdf-autotable types are not recognized correctly
        autoTable(doc, {
          startY: yPos,
          head: [section.tableHeaders],
          body: section.tableData,
          margin: { left: margin, right: margin },
          headStyles: { 
            fillColor: [255, 167, 38], // Amber color for headers
            textColor: [255, 255, 255],
            fontSize: 10
          },
          styles: {
            fontSize: 9,
            cellPadding: 3
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        });
        
        // Update yPos after table
        // @ts-ignore - lastAutoTable is from jspdf-autotable
        yPos = doc.lastAutoTable.finalY + 10;
      } else {
        const contentText = Array.isArray(section.content) 
          ? section.content.join('\n') 
          : section.content;
          
        const textLines = doc.splitTextToSize(contentText, pageWidth - margin * 2);
        
        // Check if these lines would go over the page boundary
        if (yPos + textLines.length * 7 > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(textLines, margin, yPos);
        yPos += textLines.length * 7 + 5;
      }
      
      yPos += 5; // Add some space after each section
    }
    
    // Recommendations section if provided
    if (data.recommendations && data.recommendations.length > 0) {
      // Check if we need a new page
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Key Recommendations', margin, yPos);
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      yPos += 10;
      
      // Add recommendations
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      data.recommendations.forEach((recommendation, index) => {
        // Check if we need a new page
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(`${index + 1}. ${recommendation}`, margin + 5, yPos);
        yPos += 7;
      });
    }
  }
  
  // Add footer
  const footerText = data.footerText || 'ATSBoost - South African CV Optimization Platform - www.atsboost.co.za';
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Return the PDF as a blob
  return doc.output('blob');
};

/**
 * Generate PDF report from an HTML element
 */
export const generatePDFFromElement = async (element: HTMLElement, title: string): Promise<Blob> => {
  const canvas = await html2canvas(element, {
    scale: 2,
    logging: false,
    useCORS: true
  });
  
  const imageData = canvas.toDataURL('image/jpeg', 1.0);
  
  // Create a new PDF document
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(33, 33, 33);
  doc.text(title, pageWidth / 2, 15, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const dateText = `Generated on: ${new Date().toLocaleDateString()}`;
  doc.text(dateText, pageWidth - 15, 10, { align: 'right' });
  
  // Calculate image dimensions to fit the page while maintaining aspect ratio
  const imgWidth = pageWidth - 30;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  // Add image
  let remainingHeight = imgHeight;
  let sourceY = 0;
  const pageContentHeight = pageHeight - 40;
  let destY = 25;
  
  while (remainingHeight > 0) {
    // Calculate height to use for this page
    const heightToUse = Math.min(remainingHeight, pageContentHeight);
    
    // Calculate what portion of the original image to use
    const sourceHeight = (heightToUse / imgHeight) * canvas.height;
    
    // Add image to document
    doc.addImage(
      imageData,
      'JPEG',
      15,
      destY,
      imgWidth,
      heightToUse
    );
    
    remainingHeight -= heightToUse;
    sourceY += sourceHeight;
    
    if (remainingHeight > 0) {
      doc.addPage();
      destY = 15;
    }
  }
  
  // Add footer
  const footerText = 'ATSBoost - South African CV Optimization Platform - www.atsboost.co.za';
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
  
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