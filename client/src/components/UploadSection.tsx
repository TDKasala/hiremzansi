import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SimpleUploadForm from "@/components/SimpleUploadForm";

export default function UploadSection() {
  const [uploadComplete, setUploadComplete] = useState(false);
  
  const handleUploadComplete = (data: any) => {
    setUploadComplete(true);
  };

  return (
    <section id="upload-section" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto bg-white shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <SimpleUploadForm onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}