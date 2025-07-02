import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PreUploadConsentDialog } from "@/components/PreUploadConsentDialog";

interface FileUploadProps {
  onUploadComplete?: (data: any) => void;
  acceptedFileTypes?: string;
  maxSize?: number;
  title?: string;
  description?: string;
  withJobDescription?: boolean;
}

export default function FileUpload({
  onUploadComplete,
  acceptedFileTypes = "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  maxSize = 10 * 1024 * 1024, // 10MB default
  title = "Upload your CV",
  description = "Drag and drop your CV file here or click to select",
  withJobDescription = false
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [jobDescription, setJobDescription] = useState("");
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [uploadedCvId, setUploadedCvId] = useState<number | null>(null);
  const [uploadedCVData, setUploadedCVData] = useState<any>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setError(null);
    setSelectedFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize,
    multiple: false
  });

  const removeFile = () => {
    setSelectedFile(null);
    setProgress(0);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      setIsUploading(true);
      setProgress(10); // Start with 10% to show activity

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", selectedFile.name.replace(/\.[^/.]+$/, ""));
      
      // Add job description if available
      if (withJobDescription && jobDescription) {
        formData.append("jobDescription", jobDescription);
      }

      // Simulate progress (actual progress tracking would require specialized API)
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress; // Cap at 90% until complete
        });
      }, 500);

      // We can't use apiRequest directly for file uploads because it sets JSON content-type
      // Let's use fetch directly
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with the correct boundary for multipart/form-data
        credentials: 'same-origin'
      });

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      setProgress(100);
      
      // Parse the response JSON once
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to upload file");
      }
      
      // Store the uploaded CV ID from the response
      console.log("Upload response:", data);
      if (data.cv && data.cv.id) {
        console.log("Setting CV ID:", data.cv.id);
        setUploadedCvId(data.cv.id);
        // Store the CV data for later use
        setUploadedCVData(data.cv);
        // Show the consent dialog after successful upload
        console.log("Showing consent dialog...");
        setShowConsentDialog(true);
      } else {
        console.log("No CV ID found in response");
      }
      
      toast({
        title: "File Uploaded Successfully",
        description: "Please consent to analysis to continue",
      });
      
      // We'll call onUploadComplete after analysis, not here
      
    } catch (err: any) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      setProgress(0);
      setError(err.message || "An error occurred during upload");
      
      toast({
        title: "Upload Failed",
        description: err.message || "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle consent dialog confirmation (analyze the CV)
  const handleConsentConfirm = async () => {
    if (!uploadedCvId) return;
    
    setShowConsentDialog(false);
    
    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      setIsUploading(true);
      setProgress(50); // Start analysis at 50%
      
      // Simulate progress during analysis
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);
      
      // Call the analyze endpoint
      const res = await fetch(`/api/analyze-cv/${uploadedCvId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      });
      
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || "Failed to analyze CV");
      }
      
      const data = await res.json();
      setProgress(100);
      
      toast({
        title: "CV Analysis Complete",
        description: `Your CV has been analyzed with a score of ${data.score}%`,
      });
      
      // Now call the callback after analysis is complete with combined data
      if (onUploadComplete) {
        console.log("Analysis response from backend:", data);
        const combinedData = {
          cv: uploadedCVData,
          score: data.score,
          analysis: {
            strengths: data.strengths || [],
            improvements: data.improvements || [],
            suggestions: data.suggestions || data.improvements || [] // fallback to improvements if no suggestions
          }
        };
        console.log("Sending combined data to parent:", combinedData);
        onUploadComplete(combinedData);
      }
      
    } catch (err: any) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      setProgress(0);
      setError(err.message || "An error occurred during analysis");
      
      toast({
        title: "Analysis Failed",
        description: err.message || "An error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle consent dialog close (cancel)
  const handleConsentClose = () => {
    setShowConsentDialog(false);
  };

  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Consent Dialog */}
      <PreUploadConsentDialog
        isOpen={showConsentDialog}
        onClose={handleConsentClose}
        onConfirm={handleConsentConfirm}
        cvFile={selectedFile}
      />
      
      {withJobDescription && (
        <div className="space-y-2">
          <Label htmlFor="job-description">Target Job Description</Label>
          <Textarea
            id="job-description"
            placeholder="Paste the job description here for better analysis"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            Adding the job description helps analyze your CV against specific requirements
          </p>
        </div>
      )}
      
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-3">
            <Upload className="h-10 w-10 text-gray-400" />
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground">PDF or DOCX, up to {maxSize / (1024 * 1024)}MB</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 p-2 rounded">
                <File className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-sm truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{getFileSize(selectedFile.size)}</p>
              </div>
            </div>
            {!isUploading && (
              <Button variant="ghost" size="icon" onClick={removeFile}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {progress > 0 && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-right text-muted-foreground">{Math.round(progress)}%</p>
            </div>
          )}
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          {!isUploading ? (
            <Button onClick={handleSubmit} className="w-full">
              Upload & Analyze
            </Button>
          ) : (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </Button>
          )}
        </div>
      )}
    </div>
  );
}