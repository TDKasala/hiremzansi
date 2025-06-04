import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface DownloadReportButtonProps {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions?: string[];
  issues?: string[];
  keywordRecommendations?: string[][];
  saKeywords?: string[];
  saKeywordsFound?: string[];
  saScore?: number;
  saContextScore?: number;
  userName?: string;
  cvName?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const DownloadReportButton: React.FC<DownloadReportButtonProps> = ({
  score,
  strengths,
  improvements,
  suggestions,
  issues,
  saKeywords,
  saKeywordsFound,
  saScore,
  saContextScore,
  userName,
  cvName,
  variant = 'default',
  size = 'default',
  className,
}) => {
  // Use appropriate variables based on what was passed
  const displaySuggestions = suggestions || issues || [];
  const displaySaKeywords = saKeywords || saKeywordsFound || [];
  const displaySaScore = saScore || saContextScore || 0;
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(33, 33, 33);
      doc.text('ATS Optimization Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Subtitle
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      const subtitleText = cvName ? `Analysis for: ${cvName}` : 'CV Analysis Results';
      doc.text(subtitleText, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Date and user
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const dateText = `Generated on: ${new Date().toLocaleDateString()}`;
      doc.text(dateText, pageWidth - margin, 15, { align: 'right' });
      
      if (userName) {
        doc.text(`For: ${userName}`, pageWidth - margin, 20, { align: 'right' });
      }
      
      // Add ATS score
      yPos += 10;
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, yPos, pageWidth - margin * 2, 20, 3, 3, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text('ATS Compatibility Score:', margin + 5, yPos + 8);
      
      // Draw score
      const scoreText = `${score}%`;
      doc.setFontSize(16);
      if (score >= 80) {
        doc.setTextColor(46, 125, 50); // Green for high scores
      } else if (score >= 60) {
        doc.setTextColor(255, 153, 0); // Amber for medium scores
      } else {
        doc.setTextColor(211, 47, 47); // Red for low scores
      }
      doc.text(scoreText, pageWidth - margin - 5, yPos + 8, { align: 'right' });
      
      // Add score interpretation
      let scoreInterpretation = '';
      if (score >= 80) {
        scoreInterpretation = 'Excellent - Your CV is highly optimized for ATS systems';
      } else if (score >= 60) {
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
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      strengths.forEach(strength => {
        doc.text(`• ${strength}`, margin + 5, yPos);
        yPos += 7;
      });
      
      yPos += 5;
      
      // Improvements section
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Areas for Improvement', margin, yPos);
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      improvements.forEach(improvement => {
        doc.text(`• ${improvement}`, margin + 5, yPos);
        yPos += 7;
      });
      
      yPos += 5;
      
      // Check if we need a new page
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      // South African context section
      if ((displaySaScore !== undefined) && displaySaKeywords && displaySaKeywords.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text('South African Context Analysis', margin, yPos);
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        
        doc.text(`Your CV's alignment with South African job market: ${displaySaScore}%`, margin + 5, yPos);
        yPos += 7;
        
        doc.text('South African keywords detected:', margin + 5, yPos);
        yPos += 7;
        
        displaySaKeywords.forEach(keyword => {
          doc.text(`• ${keyword}`, margin + 10, yPos);
          yPos += 7;
        });
        
        yPos += 5;
      }
      
      // Add South African recommendations
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('South African Job Market Tips', margin, yPos);
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      const saTips = [
        'Include your B-BBEE status (e.g., "B-BBEE Level 2 Contributor")',
        'Add NQF levels for all qualifications (e.g., "Bachelor of Commerce, NQF Level 7")',
        'List South African professional body memberships (e.g., SAICA, ECSA, HPCSA)',
        'Include South African languages you speak (especially if multilingual)',
        'Reference local cities/provinces where you have worked'
      ];
      
      saTips.forEach(tip => {
        doc.text(`• ${tip}`, margin + 5, yPos);
        yPos += 7;
      });
      
      // Add footer
      const footerText = 'Hire Mzansi - South African CV Optimization Platform - www.hiremzansi.co.za';
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      
      // Save and download the PDF
      doc.save(`Hire Mzansi_CV_Report_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'Report Generated',
        description: 'Your detailed CV analysis report has been downloaded',
      });
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate the PDF report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateReport}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 mr-2" />
          Download Report
        </>
      )}
    </Button>
  );
};

export default DownloadReportButton;