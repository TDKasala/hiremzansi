import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface DownloadReportButtonProps {
  score: number;
  strengths: string[];
  improvements: string[];
  issues: string[];
  keywordRecommendations?: string[][];
  jobTitle?: string;
  userName?: string;
  cvName?: string;
  saKeywordsFound?: string[];
  saContextScore?: number;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const DownloadReportButton: React.FC<DownloadReportButtonProps> = ({
  score,
  strengths,
  improvements,
  issues,
  keywordRecommendations,
  jobTitle,
  userName,
  cvName,
  saKeywordsFound,
  saContextScore,
  variant = 'default',
  size = 'default',
  className,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    try {
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
      
      if (cvName) {
        doc.setFontSize(14);
        doc.text(`CV: ${cvName}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
      }
      
      if (userName) {
        doc.setFontSize(12);
        doc.text(`For: ${userName}`, pageWidth / 2, yPos, { align: 'center' });
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
      const scoreText = `${score}%`;
      doc.setFontSize(16);
      
      // Set color based on score
      if (score >= 80) {
        doc.setTextColor(46, 125, 50); // Green
      } else if (score >= 60) {
        doc.setTextColor(255, 153, 0); // Amber
      } else {
        doc.setTextColor(211, 47, 47); // Red
      }
      
      doc.text(scoreText, pageWidth - margin - 5, yPos + 8, { align: 'right' });
      
      // Score interpretation
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
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      strengths.forEach((strength, index) => {
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
      
      improvements.forEach((improvement, index) => {
        doc.text(`• ${improvement}`, margin + 5, yPos);
        yPos += 7;
      });
      
      // Critical issues (if any)
      if (issues && issues.length > 0) {
        yPos += 5;
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text('Critical Issues', margin, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        
        issues.forEach((issue, index) => {
          doc.text(`• ${issue}`, margin + 5, yPos);
          yPos += 7;
        });
      }
      
      // South African Context (if provided)
      if (saContextScore !== undefined && saKeywordsFound && saKeywordsFound.length > 0) {
        yPos += 5;
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text('South African Context Analysis', margin, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        
        doc.text(`Your South African context score: ${saContextScore}%`, margin + 5, yPos);
        yPos += 7;
        
        doc.text('South African keywords found:', margin + 5, yPos);
        yPos += 7;
        
        let keywordLine = '';
        saKeywordsFound.forEach((keyword, index) => {
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
      if (keywordRecommendations && keywordRecommendations.length > 0) {
        yPos += 5;
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text('Keyword Recommendations', margin, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        
        keywordRecommendations.forEach(([keyword, implementation], index) => {
          doc.text(`• ${keyword}: ${implementation}`, margin + 5, yPos);
          yPos += 7;
        });
      }
      
      // Add footer
      const footerText = 'ATSBoost - South African CV Optimization Platform - www.atsboost.co.za';
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

      // Save the PDF
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ATSBoost_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Report Generated',
        description: 'Your detailed ATS analysis report has been downloaded',
      });
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGenerateReport}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Report...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Download Detailed Report
        </>
      )}
    </Button>
  );
};

export default DownloadReportButton;