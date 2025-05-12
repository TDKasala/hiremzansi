import React, { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, FileText, BarChart4, LineChart, CheckCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CV } from "@shared/schema";

interface DeepAnalysisCardProps {
  cv?: CV;
  showPaymentForm?: boolean;
}

export default function DeepAnalysisCard({ cv, showPaymentForm = true }: DeepAnalysisCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRequestAnalysis = async () => {
    if (!cv) {
      toast({
        title: "No CV Selected",
        description: "Please upload or select a CV to analyze first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setPaymentLoading(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock payment success
      toast({
        title: "Payment Successful",
        description: "Your payment of ZAR 55.50 was processed successfully.",
      });
      
      setPaymentLoading(false);
      setLoading(true);
      
      // Start the analysis progress simulation
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 10;
        if (currentProgress > 100) {
          currentProgress = 100;
          clearInterval(interval);
          
          // Simulate API call completion
          setTimeout(() => {
            setLoading(false);
            setAnalysisComplete(true);
            
            toast({
              title: "Deep Analysis Complete",
              description: "Your detailed CV analysis report is ready to download.",
            });
          }, 500);
        }
        setProgress(currentProgress);
      }, 400);
      
    } catch (error) {
      setPaymentLoading(false);
      setLoading(false);
      
      toast({
        title: "Analysis Request Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const downloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Your deep analysis report has been downloaded.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart4 className="mr-2 h-5 w-5 text-primary" />
          Deep Analysis Report
        </CardTitle>
        <CardDescription>
          Get a comprehensive South African-focused CV analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="flex justify-between mb-2 text-sm">
              <span>Analyzing CV...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            
            <div className="text-center text-sm text-muted-foreground animate-pulse">
              Optimizing for South African job market...
            </div>
          </div>
        ) : analysisComplete ? (
          <div className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-medium">Analysis Complete</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>South African Context Score</span>
                  <span className="font-medium">72%</span>
                </div>
                <Progress value={72} className="bg-gray-200 h-2" />
                
                <div className="flex justify-between items-center">
                  <span>B-BBEE Optimization</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress value={85} className="bg-gray-200 h-2" />
                
                <div className="flex justify-between items-center">
                  <span>Industry Keyword Match</span>
                  <span className="font-medium">68%</span>
                </div>
                <Progress value={68} className="bg-gray-200 h-2" />
              </div>
            </div>
            
            <Alert variant="default" className="bg-primary/5 border-primary/20">
              <FileText className="h-4 w-4" />
              <AlertTitle>Premium Report Ready</AlertTitle>
              <AlertDescription>
                Your detailed report includes South African-specific recommendations, B-BBEE optimization tips, and NQF-aligned qualification suggestions.
              </AlertDescription>
            </Alert>
          </div>
        ) : showPaymentForm ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-3">Premium Deep Analysis</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5 mr-2" />
                  <span>South African industry-specific keyword recommendations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5 mr-2" />
                  <span>B-BBEE status optimization tips</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5 mr-2" />
                  <span>NQF level presentation guidance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5 mr-2" />
                  <span>Provincial hiring trend alignment</span>
                </li>
              </ul>
              
              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Price:</span>
                  <span className="font-bold">ZAR 55.50</span>
                </div>
              </div>
            </div>
            
            {!cv && (
              <Alert variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No CV Selected</AlertTitle>
                <AlertDescription>
                  Please upload or select a CV to analyze first.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Select a CV to get started with deep analysis
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        {analysisComplete ? (
          <Button onClick={downloadReport} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        ) : (
          <Button 
            onClick={handleRequestAnalysis} 
            disabled={loading || paymentLoading || !cv} 
            className="w-full sm:w-auto"
          >
            {paymentLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <LineChart className="mr-2 h-4 w-4" />
                Get Deep Analysis (ZAR 55.50)
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}