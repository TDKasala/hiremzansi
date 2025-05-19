import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateATSReport, downloadPDF } from '@/utils/pdfGenerator';

// Import ATSBoost logo for PDF report
import atsBoostLogo from '@assets/logo.png';

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
      const reportData = {
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
        
        // Add South African specific recommendations table
        reportData.sections.push({
          title: 'South African Market Enhancement Guide',
          content: [],
          type: 'table' as const,
          tableHeaders: ['Element', 'Recommendation', 'Impact'],
          tableData: [
            ['B-BBEE Status', 'Include your B-BBEE status or level (if applicable)', 'High - Required by many employers for procurement'],
            ['NQF Levels', 'Add NQF level for each qualification', 'High - Standardizes qualification comparison'],
            ['SAQA IDs', 'Include SAQA ID numbers for qualifications', 'Medium - Verifies qualification legitimacy'],
            ['Professional Bodies', 'List memberships with SA professional bodies', 'Medium - Shows industry engagement'],
            ['Local Regulations', 'Reference relevant SA regulations in your field', 'Medium - Demonstrates compliance knowledge'],
          ],
        });
      }

      if (keywordRecommendations && keywordRecommendations.length > 0) {
        reportData.sections.push({
          title: 'Keyword Recommendations',
          content: "The following keyword additions are recommended to improve your CV's ATS performance:",
          type: 'text' as const,
        });

        reportData.sections.push({
          title: 'Suggested Keywords',
          content: [],
          type: 'table' as const,
          tableHeaders: ['Missing Keyword', 'Suggested Implementation'],
          tableData: keywordRecommendations,
        });
      }

      // Add detailed actionable recommendations for South African job market
      reportData.recommendations = [
        'Use a clean, ATS-friendly format with standard section headings (Profile, Experience, Education, Skills)',
        'Include relevant keywords from the job description naturally throughout your CV',
        'Quantify achievements with specific metrics where possible (e.g., "Increased sales by 25%")',
        'Add NQF levels for all qualifications (e.g., "Bachelor of Commerce, NQF Level 7")',
        'Include your B-BBEE status if applicable (e.g., "B-BBEE Level 2 Contributor")',
        'List South African professional body memberships (e.g., SAICA, ECSA, SAICA, HPCSA)',
        'Mention familiarity with relevant South African regulations in your industry',
        'Include South African languages you speak (especially if multilingual)',
        'Reference local cities/provinces where you have worked to establish geographical context',
        'Use South African spelling conventions (e.g., "organisation" not "organization")',
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