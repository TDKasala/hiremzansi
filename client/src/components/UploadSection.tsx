import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import SimpleUploadForm from "@/components/SimpleUploadForm";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Lightbulb } from "lucide-react";

export default function UploadSection() {
  const [uploadComplete, setUploadComplete] = useState(false);
  
  const handleUploadComplete = (data: any) => {
    setUploadComplete(true);
  };

  return (
    <section id="upload" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Analyze Your CV for Free</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Upload your CV to get instant ATS analysis and improve your chances of landing interviews with South African employers.
          </p>
        </div>
        
        <Card className="max-w-4xl mx-auto bg-white shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <SimpleUploadForm onUploadComplete={handleUploadComplete} />
            
            <Separator className="my-6" />
            
            <div className="p-6">
              <div className="flex items-start space-x-3 bg-primary/5 border border-primary/20 rounded-lg p-4">
                <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium mb-1">Did you know?</h3>
                  <p className="text-sm text-neutral-600">
                    Over 75% of South African companies use ATS systems to filter CVs. 
                    <Link href="/blog/ATSSurvivalGuide2025" className="text-primary font-medium hover:underline ml-1">
                      Learn how to pass through these filters <ArrowRight className="h-3 w-3 inline" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}