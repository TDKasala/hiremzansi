import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface PreUploadConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cvFile: File | null;
}

export function PreUploadConsentDialog({ isOpen, onClose, onConfirm, cvFile }: PreUploadConsentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>CV Upload Consent</DialogTitle>
          <DialogDescription>
            {cvFile ? `File selected: ${cvFile.name}` : 'No file selected'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            By continuing, you confirm that you consent to our use of your CV data for analysis purposes
            in accordance with our privacy policy.
          </p>
          
          <div className="bg-primary/5 p-4 rounded-md border border-primary/10">
            <h4 className="font-medium text-sm mb-2">What happens to your data?</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Your CV is stored securely in our database</li>
              <li>• We analyze it to provide you with ATS scoring and recommendations</li>
              <li>• We do not share your personal data with third parties</li>
              <li>• You can request deletion of your data at any time</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Analyze CV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}