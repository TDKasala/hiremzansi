import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

      const res = await apiRequest("POST", "/api/upload", formData);

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      setProgress(100);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || "Failed to upload file");
      }

      const data = await res.json();
      
      toast({
        title: "File Uploaded Successfully",
        description: `Your CV has been analyzed with a score of ${data.score}%`,
      });

      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete(data);
      }

      // Reset state after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setProgress(0);
      }, 1500);
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

  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Job Description Section */}
      {withJobDescription && (
        <div className="mb-4 border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <Label htmlFor="jobDescription" className="font-medium">
              Job Description (Optional)
            </Label>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Paste the job description to match your CV against specific requirements and get better analysis results.
          </p>
          <Textarea
            id="jobDescription"
            placeholder="Paste job description here..."
            className="min-h-[120px]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
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