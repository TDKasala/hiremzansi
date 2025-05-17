import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, TrendingUp, ArrowUpCircle, ArrowDownCircle, CheckCircle2 } from "lucide-react";
import { format } from 'date-fns';

// Types for our ATS analysis results
interface ATSResult {
  id: number;
  cvId: number;
  score: number;
  skillsScore: number;
  formatScore: number;
  saContextScore: number;
  strengths: string[];
  improvements: string[];
  createdAt: string;
  bbbeeDetected: boolean;
  nqfDetected: boolean;
}

interface CVBeforeAfterComparisonProps {
  cvId: number;
  latestAnalysis: ATSResult;
}

const CVBeforeAfterComparison: React.FC<CVBeforeAfterComparisonProps> = ({ cvId, latestAnalysis }) => {
  const [histories, setHistories] = useState<ATSResult[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comparison, setComparison] = useState<{
    overall: number;
    skills: number;
    format: number;
    saContext: number;
  } | null>(null);
  
  // Fetch analysis history for this CV
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // This would typically call an API endpoint
        // For now, we'll just use the latest analysis and a mock previous one
        const mockPreviousAnalysis: ATSResult = {
          ...latestAnalysis,
          id: latestAnalysis.id - 1,
          score: Math.max(20, latestAnalysis.score - 15),
          skillsScore: Math.max(20, latestAnalysis.skillsScore - 10),
          formatScore: Math.max(20, latestAnalysis.formatScore - 20),
          saContextScore: Math.max(0, latestAnalysis.saContextScore - 5),
          createdAt: new Date(new Date(latestAnalysis.createdAt).getTime() - 86400000 * 7).toISOString(), // 7 days earlier
          strengths: latestAnalysis.strengths.slice(0, latestAnalysis.strengths.length - 1),
          improvements: [...latestAnalysis.improvements, "Add more keywords related to your target position"],
          bbbeeDetected: false,
          nqfDetected: latestAnalysis.nqfDetected,
        };
        
        setHistories([mockPreviousAnalysis, latestAnalysis]);
        setSelectedHistoryId(mockPreviousAnalysis.id);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching CV analysis history:", error);
        setIsLoading(false);
      }
    };
    
    if (latestAnalysis) {
      fetchHistory();
    }
  }, [latestAnalysis, cvId]);
  
  // Calculate comparison when a previous history item is selected
  useEffect(() => {
    if (selectedHistoryId && histories.length > 1) {
      const selectedHistory = histories.find(h => h.id === selectedHistoryId);
      if (selectedHistory) {
        setComparison({
          overall: latestAnalysis.score - selectedHistory.score,
          skills: latestAnalysis.skillsScore - selectedHistory.skillsScore,
          format: latestAnalysis.formatScore - selectedHistory.formatScore,
          saContext: latestAnalysis.saContextScore - selectedHistory.saContextScore
        });
      }
    }
  }, [selectedHistoryId, histories, latestAnalysis]);
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If we don't have any history yet
  if (histories.length < 2) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>CV Improvement Tracker</CardTitle>
          <CardDescription>
            After updating your CV and running another analysis, you'll be able to see your progress here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-6 rounded-lg text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No comparison data yet</h3>
            <p className="text-muted-foreground">
              Make improvements to your CV based on our suggestions and run another analysis to see your progress.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">Update your CV now</Button>
        </CardFooter>
      </Card>
    );
  }
  
  const selectedHistory = histories.find(h => h.id === selectedHistoryId);
  
  if (!selectedHistory || !comparison) {
    return null;
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>CV Improvement Tracker</CardTitle>
        <CardDescription>
          See how your CV has improved since your previous analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Compare with:</label>
          <Select 
            value={selectedHistoryId?.toString() || ''} 
            onValueChange={(value) => setSelectedHistoryId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a previous analysis" />
            </SelectTrigger>
            <SelectContent>
              {histories
                .filter(h => h.id !== latestAnalysis.id)
                .map(history => (
                  <SelectItem key={history.id} value={history.id.toString()}>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {format(new Date(history.createdAt), "dd MMM yyyy")} - 
                        Score: {history.score}%
                      </span>
                    </div>
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="scores">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scores">Score Comparison</TabsTrigger>
            <TabsTrigger value="details">Detailed Changes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scores" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Overall Score</span>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm">{selectedHistory.score}%</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="ml-2 text-sm">{latestAnalysis.score}%</span>
                    <span className={`ml-2 text-sm ${comparison.overall > 0 ? 'text-green-500' : comparison.overall < 0 ? 'text-red-500' : ''}`}>
                      {comparison.overall > 0 ? `+${comparison.overall}` : comparison.overall}
                    </span>
                  </div>
                </div>
                <Progress value={latestAnalysis.score} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Skills Score</span>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm">{selectedHistory.skillsScore}%</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="ml-2 text-sm">{latestAnalysis.skillsScore}%</span>
                    <span className={`ml-2 text-sm ${comparison.skills > 0 ? 'text-green-500' : comparison.skills < 0 ? 'text-red-500' : ''}`}>
                      {comparison.skills > 0 ? `+${comparison.skills}` : comparison.skills}
                    </span>
                  </div>
                </div>
                <Progress value={latestAnalysis.skillsScore} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Format Score</span>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm">{selectedHistory.formatScore}%</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="ml-2 text-sm">{latestAnalysis.formatScore}%</span>
                    <span className={`ml-2 text-sm ${comparison.format > 0 ? 'text-green-500' : comparison.format < 0 ? 'text-red-500' : ''}`}>
                      {comparison.format > 0 ? `+${comparison.format}` : comparison.format}
                    </span>
                  </div>
                </div>
                <Progress value={latestAnalysis.formatScore} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">South African Context Score</span>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm">{selectedHistory.saContextScore}%</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="ml-2 text-sm">{latestAnalysis.saContextScore}%</span>
                    <span className={`ml-2 text-sm ${comparison.saContext > 0 ? 'text-green-500' : comparison.saContext < 0 ? 'text-red-500' : ''}`}>
                      {comparison.saContext > 0 ? `+${comparison.saContext}` : comparison.saContext}
                    </span>
                  </div>
                </div>
                <Progress value={latestAnalysis.saContextScore} className="h-2" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-medium text-amber-800 mb-2 flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-1" />
                  South African Context
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-24 text-sm">B-BBEE Status:</div>
                    <div className="flex-1">
                      {selectedHistory.bbbeeDetected ? 
                        <span className="text-green-600 text-sm">✓</span> : 
                        <span className="text-red-600 text-sm">✗</span>
                      }
                      <span className="mx-2">→</span>
                      {latestAnalysis.bbbeeDetected ? 
                        <span className="text-green-600 text-sm">✓</span> : 
                        <span className="text-red-600 text-sm">✗</span>
                      }
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 text-sm">NQF Levels:</div>
                    <div className="flex-1">
                      {selectedHistory.nqfDetected ? 
                        <span className="text-green-600 text-sm">✓</span> : 
                        <span className="text-red-600 text-sm">✗</span>
                      }
                      <span className="mx-2">→</span>
                      {latestAnalysis.nqfDetected ? 
                        <span className="text-green-600 text-sm">✓</span> : 
                        <span className="text-red-600 text-sm">✗</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Key Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <ArrowUpCircle className={`h-5 w-5 mr-2 ${comparison.overall > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span>Overall score improved by {Math.abs(comparison.overall)}%</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowUpCircle className={`h-5 w-5 mr-2 ${comparison.skills > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span>Skills presentation improved by {Math.abs(comparison.skills)}%</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowUpCircle className={`h-5 w-5 mr-2 ${comparison.format > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span>CV format improved by {Math.abs(comparison.format)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="font-medium mb-3">Added Strengths</h3>
                <div className="space-y-2">
                  {latestAnalysis.strengths
                    .filter(strength => !selectedHistory.strengths.includes(strength))
                    .map((strength, i) => (
                      <div key={i} className="flex items-start p-2 bg-green-50 rounded border border-green-100">
                        <ArrowUpCircle className="h-5 w-5 mr-2 text-green-500 mt-0.5" />
                        <span>{strength}</span>
                      </div>
                    ))}
                  {latestAnalysis.strengths.filter(strength => !selectedHistory.strengths.includes(strength)).length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No new strengths added</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Resolved Issues</h3>
                <div className="space-y-2">
                  {selectedHistory.improvements
                    .filter(improvement => !latestAnalysis.improvements.includes(improvement))
                    .map((improvement, i) => (
                      <div key={i} className="flex items-start p-2 bg-green-50 rounded border border-green-100">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 mt-0.5" />
                        <span>{improvement}</span>
                      </div>
                    ))}
                  {selectedHistory.improvements.filter(improvement => !latestAnalysis.improvements.includes(improvement)).length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No issues have been resolved yet</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Remaining Issues</h3>
                <div className="space-y-2">
                  {latestAnalysis.improvements.map((improvement, i) => (
                    <div key={i} className="flex items-start p-2 bg-amber-50 rounded border border-amber-100">
                      <ArrowDownCircle className="h-5 w-5 mr-2 text-amber-500 mt-0.5" />
                      <span>{improvement}</span>
                    </div>
                  ))}
                  {latestAnalysis.improvements.length === 0 && (
                    <p className="text-sm text-green-600 font-medium">Great job! No remaining issues.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Export Report</Button>
        <Button>Update CV Now</Button>
      </CardFooter>
    </Card>
  );
};

export default CVBeforeAfterComparison;