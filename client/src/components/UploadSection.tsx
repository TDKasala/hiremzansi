import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import SimpleUploadForm from "@/components/SimpleUploadForm";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";

export default function UploadSection() {
  const [uploadComplete, setUploadComplete] = useState(false);
  
  const handleUploadComplete = (data: any) => {
    setUploadComplete(true);
  };
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (file.type !== 'application/pdf' && 
        file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF or DOCX file",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 2MB",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
    setStep('upload');
  };
  
  // Step 2: Upload the file once consent is given
  const handleUpload = async () => {
    if (!selectedFile || !consent) {
      toast({
        title: "Required information missing",
        description: "Please select a file and give consent to proceed",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Use the filename without extension as the title
      const title = selectedFile.name.replace(/\.[^/.]+$/, "") || "My CV";
      formData.append('title', title);
      
      // Explicitly add the filename - this is key for our backend fix
      const timestamp = Date.now();
      const safeName = `cv_${timestamp}.${selectedFile.name.split('.').pop() || 'pdf'}`;
      formData.append('filename', safeName);
      
      // Upload to server
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
        setStep('analyze');
        
        toast({
          title: "Upload successful",
          description: "Your CV has been uploaded successfully"
        });
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Step 3: Analyze the CV
  const handleAnalyze = async () => {
    if (!uploadedCvId) {
      toast({
        title: "CV not uploaded",
        description: "Please upload your CV first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await analyzeCv(uploadedCvId);
      setStep('results');
      
      // Optionally redirect to a detailed results page
      // setLocation(`/cv/${uploadedCvId}`);
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "We couldn't analyze your CV. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Render different content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <div className="text-center py-8">
            <div className="mb-6">
              <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Select your CV file</h3>
              <p className="text-neutral-600 mb-6">
                Upload your CV to get a detailed ATS analysis and improve your chances of getting interviews.
              </p>
            </div>
            
            <input
              type="file"
              ref={(el) => fileInputRef[1] = el}
              onChange={handleFileSelect}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />
            
            <Button 
              onClick={() => fileInputRef[1]?.click()}
              className="bg-primary text-white hover:bg-opacity-90"
            >
              Select CV File
            </Button>
            
            <p className="text-sm text-neutral-500 mt-4">
              Supported formats: PDF, DOCX (Max 2MB)
            </p>
          </div>
        );
        
      case 'upload':
        return (
          <div className="py-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Ready to upload</h3>
              <div className="flex items-center border rounded p-3 mb-6">
                <div className="p-2 bg-primary/10 rounded mr-3">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedFile?.name}</p>
                  <p className="text-sm text-neutral-500">
                    {(selectedFile?.size ? (selectedFile.size / 1024).toFixed(1) : 0)} KB
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-start space-x-2 mb-4">
                  <Checkbox 
                    id="consent" 
                    checked={consent} 
                    onCheckedChange={(checked) => setConsent(checked as boolean)} 
                    required
                  />
                  <div>
                    <label 
                      htmlFor="consent" 
                      className="text-sm text-neutral-700 font-medium cursor-pointer"
                    >
                      I consent to ATSBoost processing my CV data (POPIA compliant) *
                    </label>
                    <p className="text-xs text-neutral-500 mt-1">
                      Required to proceed with analysis as per South African data protection laws
                    </p>
                  </div>
                </div>
                
                {!consent && (
                  <p className="text-xs text-red-500 font-medium mb-4">
                    Please provide consent to continue with CV analysis
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedFile(null);
                  setStep('select');
                }}
                disabled={isUploading}
              >
                Back
              </Button>
              <Button 
                className="bg-primary text-white hover:bg-opacity-90 flex-1"
                onClick={handleUpload}
                disabled={!consent || isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Uploading...
                  </>
                ) : (
                  'Upload CV'
                )}
              </Button>
            </div>
          </div>
        );
        
      case 'analyze':
        return (
          <div className="py-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">CV Uploaded Successfully</h3>
              <p className="text-neutral-600">
                Your CV has been uploaded and is ready for analysis.
              </p>
            </div>
            
            <Button 
              className="bg-primary text-white hover:bg-opacity-90 w-full"
              onClick={handleAnalyze}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Analyzing...
                </>
              ) : (
                'Analyze My CV'
              )}
            </Button>
          </div>
        );
        
      case 'results':
        return (
          <div className="py-6">
            <div className="flex flex-col md:flex-row items-start mb-6">
              <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                <div 
                  className="h-24 w-24 rounded-full border-4 border-primary flex items-center justify-center"
                >
                  <span className="text-3xl font-bold">{score}</span>
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
                
                <div className="mt-6">
                  <Button
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadedCvId(null);
                      setStep('select');
                    }}
                    className="bg-primary text-white hover:bg-opacity-90"
                  >
                    Upload a New CV
                  </Button>
                  
                  {uploadedCvId && (
                    <Button
                      variant="outline"
                      className="ml-3"
                      onClick={() => setLocation(`/cv/${uploadedCvId}`)}
                    >
                      View Detailed Report
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
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
            <p className="text-neutral-600 mb-4">
              Our AI-powered tool analyzes your CV against Applicant Tracking Systems 
              used by South African employers. Get a free score and improve your chances of landing interviews.
            </p>
            <div className="flex items-center mb-8 p-3 bg-primary/5 border border-primary/20 rounded-md">
              <Lightbulb className="h-5 w-5 text-primary shrink-0 mr-3" />
              <p className="text-sm text-neutral-700">
                Try our <Link href="/realtime-ats" className="text-primary font-medium hover:underline">Real-Time ATS Scanner</Link> to instantly see how your CV performs and get immediate feedback!
              </p>
            </div>
            
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
