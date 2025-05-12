import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 2MB",
        variant: "destructive"
      });
      return null;
    }

    // Check file type
    const fileType = file.type;
    if (fileType !== 'application/pdf' && 
        fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file",
        variant: "destructive"
      });
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Create mock progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      // Upload file to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      setUploadProgress(100);
      setUploadedFile(file);
      
      toast({
        title: "Upload successful",
        description: "Your CV has been uploaded for analysis",
      });

      return data;
    } catch (error) {
      console.error('Upload error:', error);
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    uploadProgress,
    uploadedFile,
  };
}
