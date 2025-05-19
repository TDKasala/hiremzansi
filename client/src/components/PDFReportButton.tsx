import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateATSReport, downloadPDF } from '@/utils/pdfGenerator';

// Use base64 encoded logo for PDF reports
const atsBoostLogo = 'data:image/png;base64,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';

interface PDFReportButtonProps {
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

// PDF Report data structure to match the type in pdfGenerator
interface ReportData {
  title: string;
  subtitle?: string;
  date: string;
  username?: string;
  sections: {
    title: string;
    content: string | string[];
    type?: 'text' | 'list';
  }[];
  score?: number;
  recommendations: string[];
  footerText?: string;
  companyLogo?: string;
}

const PDFReportButton: React.FC<PDFReportButtonProps> = ({
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
      // Convert image to base64 for PDF inclusion
      const logoImg = new Image();
      logoImg.src = atsBoostLogo;
      await new Promise((resolve) => {
        logoImg.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = logoImg.width;
      canvas.height = logoImg.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(logoImg, 0, 0);
      const logoBase64 = canvas.toDataURL('image/png');

      // Prepare report data
      const reportData: ReportData = {
        title: 'ATS Optimization Report',
        subtitle: jobTitle ? `For: ${jobTitle} Position` : 'CV Analysis Results',
        date: new Date().toLocaleDateString(),
        username: userName,
        score,
        companyLogo: logoBase64,
        sections: [
          {
            title: 'CV Overview',
            content: `This report analyzes your CV (${cvName || 'Uploaded CV'}) against modern Applicant Tracking Systems (ATS) criteria and South African job market standards. Your CV received an overall ATS compatibility score of ${score}%.`,
            type: 'text' as const,
          },
          {
            title: 'Key Strengths',
            content: strengths,
            type: 'list' as const,
          },
          {
            title: 'Areas for Improvement',
            content: improvements,
            type: 'list' as const,
          },
        ],
        recommendations: [],
      };

      // Add sections based on available data
      if (issues && issues.length > 0) {
        reportData.sections.push({
          title: 'Critical Issues',
          content: issues,
          type: 'list' as const,
        });
      }

      if (saKeywordsFound && saKeywordsFound.length > 0) {
        reportData.sections.push({
          title: 'South African Context Keywords',
          content: `Your CV includes ${saKeywordsFound.length} South African context-specific keywords or phrases, which is ${
            saKeywordsFound.length > 3 ? 'excellent' : 'good but could be improved'
          }. The following South African context keywords were detected:`,
          type: 'text' as const,
        });

        reportData.sections.push({
          title: 'Detected SA Keywords',
          content: saKeywordsFound,
          type: 'list' as const,
        });
      }

      if (saContextScore !== undefined) {
        // Create a more detailed South African context assessment
        reportData.sections.push({
          title: 'South African Job Market Alignment',
          content: `Your CV's alignment with South African job market requirements is ${saContextScore}%. ${
            saContextScore >= 80
              ? 'This is excellent and shows strong localization for the South African job market.'
              : saContextScore >= 60
              ? 'This is good but could be improved with more South African-specific elements.'
              : 'This needs significant improvement to better target South African employers.'
          }`,
          type: 'text' as const,
        });
        
        // Add South African specific recommendations section
        reportData.sections.push({
          title: 'South African Market Enhancement Guide',
          content: 
            'Key elements that will improve your CV for the South African job market:\n\n' +
            '• B-BBEE Status: Include your B-BBEE status or level (if applicable) - High impact, required by many employers\n\n' +
            '• NQF Levels: Add NQF level for each qualification - High impact, standardizes qualification comparison\n\n' +
            '• SAQA IDs: Include SAQA ID numbers for qualifications - Medium impact, verifies qualification legitimacy\n\n' +
            '• Professional Bodies: List memberships with SA professional bodies - Medium impact, shows industry engagement\n\n' +
            '• Local Regulations: Reference relevant SA regulations in your field - Medium impact, demonstrates compliance knowledge',
          type: 'text' as const,
        });
      }

      if (keywordRecommendations && keywordRecommendations.length > 0) {
        // Add keyword recommendations as a text section 
        const keywordContent = "The following keyword additions are recommended to improve your CV's ATS performance:\n\n" +
          keywordRecommendations.map(([keyword, implementation]) => 
            `• ${keyword}: ${implementation}`
          ).join('\n\n');
        
        reportData.sections.push({
          title: 'Keyword Recommendations',
          content: keywordContent,
          type: 'text' as const,
        });
      }

      // Add detailed actionable recommendations for South African job market
      reportData.recommendations = [
        'Use a clean, ATS-friendly format with standard section headings (Profile, Experience, Education, Skills)',
        'Include relevant keywords from the job description naturally throughout your CV',
        'Quantify achievements with specific metrics where possible (e.g., "Increased sales by 25%")',
        'Add NQF levels for all qualifications (e.g., "Bachelor of Commerce, NQF Level 7")',
        'Include your B-BBEE status if applicable (e.g., "B-BBEE Level 2 Contributor")',
        'List South African professional body memberships (e.g., SAICA, ECSA, HPCSA)',
        'Mention familiarity with relevant South African regulations in your industry',
        'Include South African languages you speak (especially if multilingual)',
        'Reference local cities/provinces where you have worked to establish geographical context',
        'Use South African spelling conventions (e.g., "organisation" not "organization")'
      ];

      // Generate and download the PDF
      const pdfBlob = await generateATSReport(reportData);
      downloadPDF(pdfBlob, `ATS_Report_${new Date().toISOString().split('T')[0]}.pdf`);

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

export default PDFReportButton;