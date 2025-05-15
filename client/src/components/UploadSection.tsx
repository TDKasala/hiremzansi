import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useDropzone } from "react-dropzone";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useAtsScore } from "@/hooks/useAtsScore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  CloudUpload, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Lightbulb
} from "lucide-react";

export default function UploadSection() {
  const [consent, setConsent] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadedCvId, setUploadedCvId] = useState<number | null>(null);
  const { uploadFile, isUploading } = useFileUpload();
  const { score, analysis, isLoading, analyzeCv } = useAtsScore();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // Function to handle analyzing the CV
  const handleAnalyzeClick = async () => {
    if (!uploadedCvId || !consent) return;
    
    try {
      // Call the analyze CV endpoint
      await analyzeCv(uploadedCvId);
      
      toast({
        title: "CV Analysis Complete",
        description: "Your CV has been analyzed successfully.",
      });
      
      // Redirect to CV details page
      setLocation(`/cv/${uploadedCvId}`);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your CV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setCvFile(file);
      try {
        const response = await uploadFile(file);
        if (response && response.cv && response.cv.id) {
          setUploadedCvId(response.cv.id);
        }
      } catch (error) {
        console.error("Upload error:", error);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    maxFiles: 1,
  });

  return (
    <section id="upload" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto bg-white shadow-lg overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">
              Upload Your CV for Free ATS Analysis
            </h2>
            <p className="text-neutral-600 mb-4">
              Our AI-powered tool analyzes your CV against Applicant Tracking Systems 
              used by South African employers. Get a free score and improve your chances of landing interviews.
            </p>
            <div className="flex items-center mb-8 p-3 bg-primary/5 border border-primary/20 rounded-md">
              <Lightbulb className="h-5 w-5 text-primary shrink-0 mr-3" />
              <p className="text-sm text-neutral-700">
                Try our <Link href="/realtime-ats" className="text-primary font-medium hover:underline">Real-Time ATS Scanner</Link> to instantly see how your resume performs and get immediate feedback!
              </p>
            </div>
            
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-6 text-center mb-8 cursor-pointer ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-neutral-300'
              }`}
            >
              <input {...getInputProps()} />
              <CloudUpload className="h-16 w-16 text-primary mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">
                {isDragActive ? "Drop your CV here" : "Drag and drop your CV here"}
              </h3>
              <p className="text-neutral-500 mb-4">or</p>
              <Button className="bg-primary text-white hover:bg-opacity-90">
                Browse Files
              </Button>
              <p className="text-sm text-neutral-500 mt-4">
                Supported formats: PDF, DOCX (Max 2MB)
              </p>
            </div>
            
            {score && !isLoading ? (
              <div className="flex flex-col md:flex-row items-start mb-6">
                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                  <div 
                    className="ats-score-display flex items-center justify-center" 
                    style={{ "--score-percentage": `${score}%` } as React.CSSProperties}
                  >
                    <div className="ats-score-text flex flex-col items-center justify-center h-full">
                      <span className="text-3xl font-bold">{score}</span>
                      <span className="text-xs text-neutral-500">ATS SCORE</span>
                    </div>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2">
                    {score >= 80 
                      ? "Your CV is excellent!" 
                      : score >= 60 
                      ? "Your CV is on the right track!" 
                      : "Your CV needs improvement!"}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {score >= 80 
                      ? "Your CV is performing exceptionally well. Here's what you're doing right:"
                      : score >= 60 
                      ? "Your CV is performing well, but there's room for improvement. Here are some quick tips:"
                      : "Your CV has several issues that might prevent it from passing ATS systems. Here's what to fix:"}
                  </p>
                  <ul className="space-y-2 text-neutral-700">
                    {analysis?.strengths?.map((strength, index) => (
                      <li key={`strength-${index}`} className="flex items-start">
                        <CheckCircle className="text-success mt-1 mr-2 h-5 w-5" />
                        <span>{strength}</span>
                      </li>
                    ))}
                    {analysis?.improvements?.map((improvement, index) => (
                      <li key={`improvement-${index}`} className="flex items-start">
                        <AlertCircle className="text-warning mt-1 mr-2 h-5 w-5" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                    {analysis?.issues?.map((issue, index) => (
                      <li key={`issue-${index}`} className="flex items-start">
                        <XCircle className="text-error mt-1 mr-2 h-5 w-5" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : isUploading || isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-neutral-600">Analyzing your CV...</p>
              </div>
            ) : null}
            
            <div className="flex flex-col sm:flex-row sm:justify-between items-center">
              <div className="mb-4 sm:mb-0 w-full sm:w-auto">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="consent" 
                    checked={consent} 
                    onCheckedChange={(checked) => setConsent(checked as boolean)} 
                  />
                  <label 
                    htmlFor="consent" 
                    className="text-sm text-neutral-600 cursor-pointer"
                  >
                    I consent to ATSBoost processing my CV data (POPIA compliant)
                  </label>
                </div>
              </div>
              <Button 
                onClick={handleAnalyzeClick}
                disabled={!consent || !cvFile} 
                className="w-full sm:w-auto bg-primary text-white hover:bg-opacity-90"
              >
                Analyze CV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
