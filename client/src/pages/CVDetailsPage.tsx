import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, FileText, Download } from 'lucide-react';
import DownloadReportButton from '@/components/DownloadReportButton';

interface CVDetails {
  id: number;
  userId: number;
  fileName: string;
  fileType: string;
  content: string;
  uploadDate: string;
  isAnalyzed: boolean;
  lastAnalysisDate: string | null;
}

interface ATSScore {
  id: number;
  cvId: number;
  score: number;
  strengths: string[];
  improvements: string[];
  issues: string[];
  keywordRecommendations: string[][];
  saKeywordsFound: string[];
  saContextScore: number;
  analysisDate: string;
}

const CVDetailsPage: React.FC = () => {
  const { id } = useParams();
  const cvId = Number(id);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: cv, isLoading: cvLoading } = useQuery<CVDetails>({
    queryKey: [`/api/cv/${cvId}`],
  });

  const { data: atsScore, isLoading: scoreLoading } = useQuery<ATSScore>({
    queryKey: [`/api/ats-score/${cvId}`],
    enabled: !!cv?.isAnalyzed,
    staleTime: 60000, // Cache for 1 minute to prevent unnecessary refetches
  });

  if (cvLoading || scoreLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CV details...</p>
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>CV Not Found</CardTitle>
            <CardDescription>The CV you are looking for does not exist or has been removed.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please return to the dashboard and try again.</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const formattedDate = new Date(cv.uploadDate).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const renderScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-600';
  };

  const renderProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-600';
  };

  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>CV Analysis Details | ATSBoost</title>
        <meta
          name="description"
          content="Detailed analysis of your CV's ATS compatibility score, strengths, and improvement areas."
        />
      </Helmet>

      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{cv.fileName}</h1>
          <p className="text-gray-500">Uploaded on {formattedDate}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              View All CVs
            </Button>
          </Link>
          
          {atsScore && (
            <DownloadReportButton
              score={atsScore.score}
              strengths={atsScore.strengths}
              improvements={atsScore.improvements}
              suggestions={atsScore.issues || []}
              saKeywords={atsScore.saKeywordsFound}
              saScore={atsScore.saContextScore}
              cvName={cv.fileName}
            />
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-1/2 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!cv.isAnalyzed}>
            ATS Analysis
          </TabsTrigger>
          <TabsTrigger value="content">CV Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CV Overview</CardTitle>
              <CardDescription>Basic information about your CV</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">File Name</h3>
                  <p>{cv.fileName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">File Type</h3>
                  <p>{cv.fileType}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Upload Date</h3>
                  <p>{formattedDate}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Analysis Status</h3>
                  <div className="flex items-center">
                    {cv.isAnalyzed ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span>Analyzed</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-5 w-5 text-amber-500 mr-2" />
                        <span>Not Analyzed</span>
                      </>
                    )}
                  </div>
                </div>
                {cv.isAnalyzed && cv.lastAnalysisDate && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-500">Last Analysis</h3>
                    <p>
                      {new Date(cv.lastAnalysisDate).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {!cv.isAnalyzed && (
                <Button>
                  Analyze CV
                </Button>
              )}
            </CardFooter>
          </Card>

          {cv.isAnalyzed && atsScore && (
            <Card>
              <CardHeader>
                <CardTitle>ATS Compatibility Score</CardTitle>
                <CardDescription>
                  How well your CV is optimized for Applicant Tracking Systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 text-center">
                  <div className="text-5xl font-bold mb-2 transition-all duration-700 ease-out">
                    <span className={renderScoreColor(atsScore.score)}>{atsScore.score}%</span>
                  </div>
                  <Progress value={atsScore.score} className={`h-2 ${renderProgressColor(atsScore.score)}`} />
                  <p className="mt-2">
                    {atsScore.score >= 80
                      ? 'Excellent - Your CV is highly optimized for ATS systems'
                      : atsScore.score >= 60
                      ? 'Good - Your CV performs well but has room for improvement'
                      : 'Needs Improvement - Your CV requires significant optimization'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Key Strengths</h3>
                    <ul className="space-y-1">
                      {atsScore.strengths.slice(0, 3).map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Areas for Improvement</h3>
                    <ul className="space-y-1">
                      {atsScore.improvements.slice(0, 3).map((improvement, index) => (
                        <li key={index} className="flex items-start">
                          <XCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setActiveTab('analysis')} variant="outline">
                  View Detailed Analysis
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {atsScore && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>ATS Score Breakdown</CardTitle>
                  <CardDescription>Detailed analysis of your CV's ATS compatibility</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Overall Score</h3>
                      <span className={`font-bold ${renderScoreColor(atsScore.score)}`}>{atsScore.score}%</span>
                    </div>
                    <Progress value={atsScore.score} className={renderProgressColor(atsScore.score)} />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">South African Context Score</h3>
                      <span className={`font-bold ${renderScoreColor(atsScore.saContextScore)}`}>
                        {atsScore.saContextScore}%
                      </span>
                    </div>
                    <Progress value={atsScore.saContextScore} className={renderProgressColor(atsScore.saContextScore)} />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Key Strengths</h3>
                    <ul className="space-y-2">
                      {atsScore.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Areas for Improvement</h3>
                    <ul className="space-y-2">
                      {atsScore.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start">
                          <XCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {atsScore.issues.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-3">Critical Issues</h3>
                        <ul className="space-y-2">
                          {atsScore.issues.map((issue, index) => (
                            <li key={index} className="flex items-start">
                              <XCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">South African Context</h3>
                    <p className="mb-3">
                      Your CV includes {atsScore.saKeywordsFound.length} South African context-specific keywords or
                      phrases, which is{' '}
                      {atsScore.saKeywordsFound.length > 3 ? 'excellent' : 'good but could be improved'}.
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {atsScore.saKeywordsFound.map((keyword, index) => (
                        <Badge key={index} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>

                    <p>
                      <strong>SA Context Score:</strong> {atsScore.saContextScore}% -{' '}
                      {atsScore.saContextScore >= 80
                        ? 'Excellent alignment with South African job market requirements'
                        : atsScore.saContextScore >= 60
                        ? 'Good alignment but could be improved'
                        : 'Needs better alignment with South African job market requirements'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {atsScore.keywordRecommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Recommendations</CardTitle>
                    <CardDescription>
                      Suggested keywords and how to implement them in your CV
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableCaption>Recommendations to improve ATS compatibility</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Missing Keyword</TableHead>
                          <TableHead>Suggested Implementation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {atsScore.keywordRecommendations.map(([keyword, implementation], index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{keyword}</TableCell>
                            <TableCell>{implementation}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>CV Content</CardTitle>
              <CardDescription>The extracted text content from your CV</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-md p-4 whitespace-pre-wrap font-mono text-sm border">
                {cv.content}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CVDetailsPage;