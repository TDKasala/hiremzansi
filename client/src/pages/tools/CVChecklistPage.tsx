import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, Download, FileCheck, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import CVCheckPDF from "@/assets/tools/CV Check.pdf";

interface ChecklistItem {
  id: string;
  category: string;
  text: string;
  checked: boolean;
}

const CVChecklistPage: React.FC = () => {
  const { toast } = useToast();
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    // Contact Information
    { id: "contact-1", category: "Contact Information", text: "Full Name is clearly displayed", checked: false },
    { id: "contact-2", category: "Contact Information", text: "Professional email address (e.g., name@gmail.com)", checked: false },
    { id: "contact-3", category: "Contact Information", text: "Phone number with country code (+27)", checked: false },
    { id: "contact-4", category: "Contact Information", text: "LinkedIn profile URL (optional but preferred)", checked: false },
    { id: "contact-5", category: "Contact Information", text: "Location (city, province)", checked: false },
    
    // Professional Summary
    { id: "summary-1", category: "Professional Summary", text: "Concise summary (2-4 sentences)", checked: false },
    { id: "summary-2", category: "Professional Summary", text: "Includes relevant industry keywords", checked: false },
    { id: "summary-3", category: "Professional Summary", text: "Customized to match the specific job", checked: false },
    
    // Skills Section
    { id: "skills-1", category: "Skills Section", text: "6-10 relevant hard skills listed", checked: false },
    { id: "skills-2", category: "Skills Section", text: "Includes job-specific tools and systems", checked: false },
    { id: "skills-3", category: "Skills Section", text: "Incorporates South African terminology (B-BBEE, POPIA, etc.)", checked: false },
    { id: "skills-4", category: "Skills Section", text: "Balanced mix of technical and soft skills", checked: false },
    
    // Work Experience
    { id: "work-1", category: "Work Experience", text: "Job titles are clear and accurate", checked: false },
    { id: "work-2", category: "Work Experience", text: "Company names and locations included", checked: false },
    { id: "work-3", category: "Work Experience", text: "Employment dates (month/year format)", checked: false },
    { id: "work-4", category: "Work Experience", text: "Bullet points use action verbs (Led, Managed, Improved)", checked: false },
    { id: "work-5", category: "Work Experience", text: "Achievements quantified with metrics where possible", checked: false },
    { id: "work-6", category: "Work Experience", text: "Most recent experience has more detail than older roles", checked: false },
    
    // Education & Certifications
    { id: "edu-1", category: "Education & Certifications", text: "Degrees listed with institutions and dates", checked: false },
    { id: "edu-2", category: "Education & Certifications", text: "NQF levels mentioned where applicable", checked: false },
    { id: "edu-3", category: "Education & Certifications", text: "Relevant certifications included", checked: false },
    { id: "edu-4", category: "Education & Certifications", text: "Education section properly formatted", checked: false },
    
    // Formatting & Design
    { id: "format-1", category: "Formatting & Design", text: "Length is 1-2 pages (appropriate for role level)", checked: false },
    { id: "format-2", category: "Formatting & Design", text: "Clean, readable font (Calibri, Arial, etc.)", checked: false },
    { id: "format-3", category: "Formatting & Design", text: "Consistent formatting (headings, bullets, alignment)", checked: false },
    { id: "format-4", category: "Formatting & Design", text: "No unnecessary graphics or images", checked: false },
    { id: "format-5", category: "Formatting & Design", text: "Saved as PDF format", checked: false },
    
    // ATS Optimization
    { id: "ats-1", category: "ATS Optimization", text: "Keywords from job description included", checked: false },
    { id: "ats-2", category: "ATS Optimization", text: "No headers/footers with important information", checked: false },
    { id: "ats-3", category: "ATS Optimization", text: "No tables, text boxes, or complex formatting", checked: false },
    { id: "ats-4", category: "ATS Optimization", text: "Simple section headings", checked: false },
    { id: "ats-5", category: "ATS Optimization", text: "No columns or multi-column layouts", checked: false },
    
    // Final Checks
    { id: "final-1", category: "Final Checks", text: "Spelling and grammar checked", checked: false },
    { id: "final-2", category: "Final Checks", text: "No personal pronouns (I, me, my)", checked: false },
    { id: "final-3", category: "Final Checks", text: "Tailored for the specific job application", checked: false },
    { id: "final-4", category: "Final Checks", text: "No unexplained gaps in employment", checked: false },
    { id: "final-5", category: "Final Checks", text: "Contact information on every page", checked: false },
  ]);
  
  const categories = [...new Set(checklistItems.map(item => item.category))];
  
  const handleCheckboxChange = (id: string) => {
    setChecklistItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };
  
  const getCompletionPercentage = () => {
    const checkedCount = checklistItems.filter(item => item.checked).length;
    return Math.round((checkedCount / checklistItems.length) * 100);
  };
  
  const resetChecklist = () => {
    setChecklistItems(prevItems =>
      prevItems.map(item => ({ ...item, checked: false }))
    );
    toast({
      title: "Checklist Reset",
      description: "All items have been unchecked",
    });
  };
  
  const downloadPDF = () => {
    window.open(CVCheckPDF, '_blank');
  };
  
  return (
    <div className="container mx-auto px-4 py-10">
      <Helmet>
        <title>CV Checklist | ATSBoost</title>
        <meta 
          name="description" 
          content="Complete South African specific CV checklist with 50+ points to ensure your resume meets local standards and passes ATS systems."
        />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center">
            <FileCheck className="mr-3 h-8 w-8 text-primary" />
            CV Checklist
          </h1>
          <p className="text-muted-foreground mt-2">
            Ensure your CV meets South African hiring standards with this comprehensive checklist
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="bg-muted/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your CV Score</CardTitle>
                <CardDescription>Track your progress as you complete the checklist</CardDescription>
              </div>
              <div className="text-2xl font-bold text-primary">
                {getCompletionPercentage()}%
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Progress value={getCompletionPercentage()} className="h-3 mb-4" />
            
            <div className="flex flex-wrap justify-between gap-4 mt-4">
              <Button onClick={resetChecklist} variant="outline" size="sm">
                Reset Checklist
              </Button>
              
              <Button onClick={downloadPDF} className="flex items-center" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download PDF Checklist
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          {categories.map((category) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-full max-h-[300px]">
                  <div className="space-y-3">
                    {checklistItems
                      .filter(item => item.category === category)
                      .map(item => (
                        <div key={item.id} className="flex items-start space-x-3 py-1">
                          <Checkbox
                            id={item.id}
                            checked={item.checked}
                            onCheckedChange={() => handleCheckboxChange(item.id)}
                            className="mt-0.5"
                          />
                          <label
                            htmlFor={item.id}
                            className={`text-sm cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {item.text}
                          </label>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 bg-muted/30 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
            Expert Tips
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Tailor your CV for each job application by incorporating the exact keywords from the job description.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>South African employers often value B-BBEE status, so include this information where relevant.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>When listing education, include NQF levels for qualifications to help employers understand your education level.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Keep your CV to a maximum of 2 pages unless you're applying for an executive or academic position.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              <span>Quantify your achievements with numbers where possible (e.g., "Increased sales by 25%").</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CVChecklistPage;