import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SimpleUploadForm from "@/components/SimpleUploadForm";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Lightbulb, FileText, Zap, Target } from "lucide-react";

export default function UploadSection() {
  const [uploadComplete, setUploadComplete] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [showJobAnalysis, setShowJobAnalysis] = useState(false);
  
  const handleUploadComplete = (data: any) => {
    setUploadComplete(true);
  };

  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value);
    setShowJobAnalysis(value.length > 50);
  };

  return (
    <section id="upload-section" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto bg-white shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <SimpleUploadForm onUploadComplete={handleUploadComplete} />
            
            <Separator className="my-6" />
            
            {/* Job Description Analysis Section */}
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Job-Specific CV Analysis</h3>
                  <p className="text-sm text-gray-600">Paste a job description to get targeted optimization recommendations</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description (Optional but Recommended)
                  </label>
                  <textarea
                    id="job-description"
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => handleJobDescriptionChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Paste the job description here to get customized CV analysis...

Example:
We are seeking a Senior Software Engineer with 5+ years of experience in React, Node.js, and TypeScript. The candidate should have experience with cloud platforms (AWS, Azure), agile methodologies, and team leadership. B-BBEE candidates preferred. Located in Cape Town or remote."
                  />
                </div>

                {showJobAnalysis && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Enhanced Analysis Ready</h4>
                        <p className="text-sm text-blue-700">
                          Your CV will be analyzed against this specific job description to identify:
                        </p>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                          <li>• Keyword match percentage</li>
                          <li>• Missing skills and qualifications</li>
                          <li>• Experience alignment score</li>
                          <li>• Recommendations for optimization</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {jobDescription && (
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setJobDescription("");
                        setShowJobAnalysis(false);
                      }}
                      className="flex-1"
                    >
                      Clear Job Description
                    </Button>
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={!uploadComplete}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Analyze CV vs Job Description
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-start space-x-3 bg-primary/5 border border-primary/20 rounded-lg p-4">
                <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium mb-1">Pro Tip</h3>
                  <p className="text-sm text-neutral-600">
                    Adding a job description increases your ATS score accuracy by up to 40%. Our AI will identify specific keywords and requirements from the posting.
                    <Link href="/blog/ATSSurvivalGuide2025" className="text-primary font-medium hover:underline ml-1">
                      Learn more about ATS optimization <ArrowRight className="h-3 w-3 inline" />
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