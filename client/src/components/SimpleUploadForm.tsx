import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, CheckCircle, XCircle, AlertCircle, Lightbulb, FileText } from "lucide-react";
import { useAtsScore } from "@/hooks/useAtsScore";

interface SimpleUploadFormProps {
  onUploadComplete?: (data: any) => void;
  withJobDescription?: boolean;
}

export default function SimpleUploadForm({ 
  onUploadComplete,
  withJobDescription = false
}: SimpleUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCvId, setUploadedCvId] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const { score, analysis, isLoading, analyzeCv } = useAtsScore();
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      if (selectedFile.type !== 'application/pdf' && 
          selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF or DOCX file",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (2MB max)
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 2MB",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }
    
    if (!consent) {
      toast({
        title: "Consent required",
        description: "Please consent to data processing before uploading",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      // Use filename without extension as title
      const title = file.name.replace(/\.[^/.]+$/, "") || "My CV";
      formData.append('title', title);
      
      // Generate a safe filename with timestamp
      const timestamp = Date.now();
      const fileExt = file.type.includes('pdf') ? 'pdf' : 'docx';
      const safeName = `cv_${timestamp}.${fileExt}`;
      formData.append('filename', safeName);
      
      // Add job description if available
      if (withJobDescription && jobDescription) {
        formData.append('jobDescription', jobDescription);
      }
      
      // Upload the file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.cv && data.cv.id) {
        setUploadedCvId(data.cv.id);
        
        // Analyze the CV
        await analyzeCv(data.cv.id);
        setShowResults(true);
        
        // Call the parent component's onUploadComplete callback if provided
        if (onUploadComplete) {
          onUploadComplete(data);
        }
        
        toast({
          title: "Success",
          description: "CV uploaded and analyzed successfully"
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <section id="upload" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto bg-white shadow-lg overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">
              Upload Your CV for Free ATS Analysis
            </h2>
            
            <div className="flex items-center mb-6 p-3 bg-primary/5 border border-primary/20 rounded-md">
              <Lightbulb className="h-5 w-5 text-primary shrink-0 mr-3" />
              <p className="text-sm text-neutral-700">
                Try our <Link href="/realtime-ats" className="text-primary font-medium hover:underline">Real-Time ATS Scanner</Link> to instantly see how your CV performs!
              </p>
            </div>
            
            {!showResults ? (
              <div className="space-y-6">
                {/* Job Description Input */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <label htmlFor="job-description" className="text-lg font-semibold">
                      Job Description (Optional)
                    </label>
                  </div>
                  <textarea
                    id="job-description"
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    placeholder="Paste the job description here for targeted CV analysis..."
                  />
                  {jobDescription ? (
                    <p className="mt-2 text-xs text-green-600">
                      ✓ Job description added - your CV will be analyzed specifically for this position
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-neutral-600">
                      Adding a job description helps us analyze your CV specifically for the position you're applying for
                    </p>
                  )}
                </div>

                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <CloudUpload className="h-16 w-16 text-primary mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">
                    {file ? `Selected: ${file.name}` : "Select your CV file"}
                  </h3>
                  
                  <div className="mb-4">
                    <input
                      type="file"
                      id="cv-file"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                    />
                    <Button
                      onClick={() => document.getElementById('cv-file')?.click()}
                      className="bg-primary text-white hover:bg-opacity-90"
                    >
                      {file ? "Change File" : "Browse Files"}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-neutral-500">
                    Supported formats: PDF, DOCX (Max 2MB)
                  </p>
                </div>
                
                <div className="flex items-start space-x-2 mb-6">
                  <Checkbox 
                    id="consent-checkbox" 
                    checked={consent} 
                    onCheckedChange={(checked) => setConsent(checked as boolean)} 
                  />
                  <div>
                    <label 
                      htmlFor="consent-checkbox" 
                      className="text-sm text-neutral-700 font-medium cursor-pointer"
                    >
                      I consent to Hire Mzansi processing my CV data (POPIA compliant) *
                    </label>
                    <p className="text-xs text-neutral-500 mt-1">
                      This consent is required to proceed with analysis as per South African data protection laws
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleUpload}
                  disabled={!file || !consent || isUploading} 
                  className="w-full bg-primary text-white hover:bg-opacity-90"
                >
                  {isUploading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Uploading & Analyzing...
                    </>
                  ) : (
                    'Analyze CV'
                  )}
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex flex-col md:flex-row items-start mb-6">
                  <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <div 
                      className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center animate-pulse"
                    >
                      <span className="text-xl font-bold">{score || 0}</span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2">
                      {score && score >= 80 
                        ? "Your CV is excellent!" 
                        : score && score >= 60 
                        ? "Your CV is on the right track!" 
                        : "Your CV needs improvement!"}
                    </h3>
                    <p className="text-neutral-600 mb-4">
                      {score && score >= 80 
                        ? "Your CV is performing exceptionally well. Here's what you're doing right:"
                        : score && score >= 60 
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
                    
                    <div className="mt-6">
                      <Button
                        onClick={() => {
                          setFile(null);
                          setUploadedCvId(null);
                          setShowResults(false);
                        }}
                        className="bg-primary text-white hover:bg-opacity-90"
                      >
                        Upload Another CV
                      </Button>
                      
                      {uploadedCvId && (
                        <Button
                          variant="outline"
                          className="ml-3"
                          onClick={() => {
                            // Check if user is authenticated before redirecting
                            fetch('/api/user')
                              .then(res => {
                                if (res.ok) {
                                  // User is logged in, go to details page
                                  window.location.href = `/cv/${uploadedCvId}`;
                                } else {
                                  // User is not logged in, save CV ID to localStorage and redirect to auth with prompt
                                  localStorage.setItem('pendingCvId', String(uploadedCvId));
                                  window.location.href = `/auth?action=signup&message=signup-for-report`;
                                }
                              })
                              .catch(() => {
                                // Error checking auth status, default to auth page
                                localStorage.setItem('pendingCvId', String(uploadedCvId));
                                window.location.href = `/auth?action=signup&message=signup-for-report`;
                              });
                          }}
                        >
                          View Detailed Report
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}