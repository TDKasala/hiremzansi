import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { CheckCircle2, AlertCircle, Check, X, Info, Award, FileCheck, Lightbulb, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// CV checklist categories with items
const cvChecklist = {
  essentials: [
    { 
      id: "contact", 
      label: "Contact Information", 
      description: "Full name, phone number, email, location, and LinkedIn profile",
      importance: "critical",
      saContext: "Include your full name exactly as it appears on official documents",
      tip: "Consider using a professional email address based on your name, not nicknames"
    },
    { 
      id: "summary", 
      label: "Professional Summary", 
      description: "Brief overview of your experience, skills, and career goals",
      importance: "critical",
      saContext: "Mention relevant South African qualifications and certifications",
      tip: "Keep this to 3-5 sentences that highlight your most impressive qualifications"
    },
    { 
      id: "experience", 
      label: "Work Experience", 
      description: "Current and previous jobs with company names, dates, and responsibilities",
      importance: "critical",
      saContext: "Include company sectors (e.g., JSE-listed, multinational, SOE) for context",
      tip: "Use bullet points with action verbs and quantifiable achievements"
    },
    { 
      id: "education", 
      label: "Education", 
      description: "Academic qualifications with institutions, dates, and fields of study",
      importance: "critical",
      saContext: "Include NQF levels and SAQA verification for all qualifications",
      tip: "List your education in reverse chronological order (most recent first)"
    },
    { 
      id: "skills", 
      label: "Skills Section", 
      description: "Technical and soft skills relevant to the position",
      importance: "critical",
      saContext: "Include local software systems or methodologies used in South Africa",
      tip: "Group skills by category (e.g., Technical, Software, Soft Skills) for better readability"
    }
  ],
  formatting: [
    { 
      id: "length", 
      label: "Appropriate Length", 
      description: "CV should be 2-3 pages maximum for most positions",
      importance: "high",
      saContext: "South African CVs tend to be slightly longer than international ones",
      tip: "For senior roles, 3 pages is acceptable; for entry-level, aim for 2 pages"
    },
    { 
      id: "font", 
      label: "Professional Font", 
      description: "Use clean, readable fonts (Arial, Calibri, Times New Roman)",
      importance: "medium",
      saContext: "Standard international fonts are widely accepted in South Africa",
      tip: "Stick to 10-12pt font size for body text and 14-16pt for headings"
    },
    { 
      id: "spacing", 
      label: "Consistent Spacing", 
      description: "Even spacing between sections with clear visual hierarchy",
      importance: "medium",
      saContext: "Well-spaced documents are universally preferred",
      tip: "Use 1.0-1.15 line spacing for body text and add extra space between sections"
    },
    { 
      id: "margins", 
      label: "Appropriate Margins", 
      description: "Margins should be between 0.5-1 inch on all sides",
      importance: "medium",
      saContext: "Standard margin sizes apply in South Africa",
      tip: "Avoid reducing margins below 0.5 inches as it makes the CV look cramped"
    },
    { 
      id: "alignment", 
      label: "Consistent Alignment", 
      description: "Text should be consistently left-aligned or justified",
      importance: "medium",
      saContext: "Left alignment is most common in South African business documents",
      tip: "Avoid center alignment except for your name and contact details at the top"
    }
  ],
  content: [
    { 
      id: "achievements", 
      label: "Quantifiable Achievements", 
      description: "Specific results and accomplishments for each role",
      importance: "high",
      saContext: "Include achievements related to B-BBEE initiatives if applicable",
      tip: "Use numbers, percentages, and specific metrics to demonstrate impact"
    },
    { 
      id: "keywords", 
      label: "Industry Keywords", 
      description: "Relevant keywords from job description and industry",
      importance: "high",
      saContext: "Include South African industry-specific terminology and acronyms",
      tip: "Review job descriptions for frequently mentioned skills and include them naturally"
    },
    { 
      id: "consistency", 
      label: "Consistent Formatting", 
      description: "Uniform date formats, bullet styles, and section layouts",
      importance: "high",
      saContext: "Use day-month-year format (DD/MM/YYYY) common in South Africa",
      tip: "Create a template for each type of information to ensure consistency"
    },
    { 
      id: "tailoring", 
      label: "Tailored Content", 
      description: "CV customized for specific job or industry",
      importance: "high",
      saContext: "Address specific South African market needs or challenges",
      tip: "Adjust your professional summary and highlighted skills for each application"
    },
    { 
      id: "chronology", 
      label: "Reverse Chronological Order", 
      description: "Most recent experiences and education listed first",
      importance: "medium",
      saContext: "Standard format expected by South African employers",
      tip: "Always start with your current or most recent position"
    }
  ],
  southAfrican: [
    { 
      id: "bbbee", 
      label: "B-BBEE Status", 
      description: "B-BBEE level if applicable to your situation",
      importance: "high",
      saContext: "Essential for many public and private sector opportunities",
      tip: "Include this information in a 'Personal Details' section if relevant"
    },
    { 
      id: "nqf", 
      label: "NQF Levels", 
      description: "National Qualifications Framework levels for qualifications",
      importance: "high",
      saContext: "NQF levels help employers understand your qualification equivalency",
      tip: "Format as 'Bachelor of Science (NQF Level 7)' for clarity"
    },
    { 
      id: "languages", 
      label: "South African Languages", 
      description: "Proficiency in local official languages",
      importance: "medium",
      saContext: "Multilingual skills are highly valued in South Africa",
      tip: "Indicate proficiency levels (Basic, Intermediate, Fluent, Native)"
    },
    { 
      id: "associations", 
      label: "Professional Body Membership", 
      description: "Membership in SA professional organizations",
      importance: "medium",
      saContext: "Validates professional standing in regulated fields",
      tip: "Include membership numbers for verification purposes"
    },
    { 
      id: "id-status", 
      label: "Work Authorization", 
      description: "ID type or work permit status if relevant",
      importance: "high",
      saContext: "Employers need to know if you can legally work in South Africa",
      tip: "Simply state 'South African Citizen' or specific work visa status"
    }
  ],
  additional: [
    { 
      id: "photo", 
      label: "Professional Photo (Optional)", 
      description: "Small, professional headshot if appropriate",
      importance: "low",
      saContext: "Photos are more common on South African CVs than in some Western countries",
      tip: "If included, use a professional headshot with neutral background"
    },
    { 
      id: "references", 
      label: "References Available", 
      description: "Note that references are available upon request",
      importance: "medium",
      saContext: "References are commonly expected in South African job applications",
      tip: "You can state 'References available upon request' rather than listing them"
    },
    { 
      id: "projects", 
      label: "Relevant Projects", 
      description: "Notable projects that demonstrate key skills",
      importance: "medium",
      saContext: "Include projects relevant to South African market needs",
      tip: "Use metrics to show the impact of projects where possible"
    },
    { 
      id: "certifications", 
      label: "Certifications & Training", 
      description: "Additional professional certifications and courses",
      importance: "medium",
      saContext: "Include SETA-accredited courses and other recognized training",
      tip: "List completion dates and certification numbers where applicable"
    },
    { 
      id: "volunteer", 
      label: "Volunteer Experience", 
      description: "Relevant community service or volunteer roles",
      importance: "low",
      saContext: "Community involvement is valued in South African work culture",
      tip: "Include skills developed and leadership roles in volunteer positions"
    }
  ],
  redFlags: [
    { 
      id: "no-errors", 
      label: "No Spelling/Grammar Errors", 
      description: "CV should be free of spelling and grammar mistakes",
      importance: "critical",
      saContext: "Spelling errors create a poor impression universally",
      tip: "Use spell check and ask someone else to proofread your CV"
    },
    { 
      id: "no-gaps", 
      label: "Explained Employment Gaps", 
      description: "Brief explanation for significant gaps in employment",
      importance: "high",
      saContext: "South African employers typically expect gaps to be explained",
      tip: "Briefly mention constructive activities during gaps (study, freelance, etc.)"
    },
    { 
      id: "no-irrelevant", 
      label: "No Irrelevant Information", 
      description: "Exclude hobbies and personal details unrelated to the job",
      importance: "medium",
      saContext: "Focus on professional information unless hobbies demonstrate job-relevant skills",
      tip: "Only include personal interests if they demonstrate job-relevant qualities"
    },
    { 
      id: "no-jargon", 
      label: "Avoid Unexplained Jargon", 
      description: "Industry-specific terms should be understandable",
      importance: "medium",
      saContext: "Explain South African industry-specific terms if applying internationally",
      tip: "Have someone outside your field review your CV for clarity"
    },
    { 
      id: "no-photo", 
      label: "No Inappropriate Photos", 
      description: "If including a photo, ensure it's professional",
      importance: "high",
      saContext: "Conservative, professional dress standards apply for CV photos",
      tip: "If in doubt, it's better to omit a photo than include an inappropriate one"
    }
  ]
};

// South African CV expert tips
const saExpertTips = [
  {
    title: "Include B-BBEE Status Appropriately",
    description: "If you have a favorable B-BBEE status, include it in a 'Personal Details' section. This is especially important when applying to companies with B-BBEE procurement targets.",
    icon: <Award className="h-5 w-5" />
  },
  {
    title: "Showcase NQF Levels for All Qualifications",
    description: "Always specify the NQF level of your qualifications, e.g., 'Bachelor of Commerce (NQF Level 7)'. This helps employers understand how your qualifications align with the South African framework.",
    icon: <FileCheck className="h-5 w-5" />
  },
  {
    title: "Highlight South African Regulatory Knowledge",
    description: "Mention familiarity with relevant local regulations (Companies Act, POPIA, FICA, etc.) where applicable to your profession.",
    icon: <Info className="h-5 w-5" />
  },
  {
    title: "Include Multiple Language Proficiencies",
    description: "Detail your proficiency in South African official languages, as multilingual skills are highly valued in customer-facing roles and companies with diverse workforces.",
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    title: "Mention Professional Body Registrations",
    description: "Include your registration numbers with professional bodies such as SAICA, ECSA, HPCSA, or other regulatory organizations relevant to your field.",
    icon: <Award className="h-5 w-5" />
  }
];

const CVChecklistPage = () => {
  const { toast } = useToast();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState("essentials");
  
  // Calculate progress for each category
  const calculateCategoryProgress = (category: string) => {
    const items = cvChecklist[category as keyof typeof cvChecklist];
    if (!items) return 0;
    
    const checkedCount = items.filter(item => checkedItems[item.id]).length;
    return Math.round((checkedCount / items.length) * 100);
  };
  
  // Calculate overall progress
  const calculateOverallProgress = () => {
    let totalItems = 0;
    let checkedCount = 0;
    
    Object.values(cvChecklist).forEach(category => {
      totalItems += category.length;
      checkedCount += category.filter(item => checkedItems[item.id]).length;
    });
    
    return Math.round((checkedCount / totalItems) * 100);
  };
  
  const handleCheckItem = (id: string, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [id]: checked }));
    
    if (checked) {
      toast({
        title: "Item Completed",
        description: "Your CV checklist item has been marked as complete",
      });
    }
  };
  
  // Reset checklist to start over
  const resetChecklist = () => {
    setCheckedItems({});
    toast({
      title: "Checklist Reset",
      description: "Your CV checklist has been reset to start over",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>CV Checklist | ATSBoost</title>
        <meta name="description" content="Ensure your CV is perfect for the South African job market with our comprehensive checklist. Include all essential elements and avoid common mistakes." />
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">South African CV Checklist</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Ensure your CV has all the essential elements for the South African job market and avoid common mistakes
        </p>
      </div>
      
      {/* Overall Progress */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Overall Progress</span>
            <Badge variant={calculateOverallProgress() === 100 ? "default" : "outline"}
                   className={calculateOverallProgress() === 100 ? "bg-green-500 text-white" : ""}>
              {calculateOverallProgress()}% Complete
            </Badge>
          </CardTitle>
          <CardDescription>Track your progress through the entire CV checklist</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={calculateOverallProgress()} className="h-3" />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-6">
            {Object.keys(cvChecklist).map(category => (
              <Button 
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                className={activeCategory === category ? "bg-amber-500 hover:bg-amber-600" : ""}
                onClick={() => setActiveCategory(category)}
              >
                <div className="w-full text-center">
                  <div className="text-xs capitalize">{category}</div>
                  <Progress 
                    value={calculateCategoryProgress(category)} 
                    className="h-1.5 mt-1.5"
                  />
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{Object.values(checkedItems).filter(Boolean).length}</span> of{" "}
            <span className="font-medium">
              {Object.values(cvChecklist).reduce((total, items) => total + items.length, 0)}
            </span>{" "}
            items completed
          </div>
          <Button variant="outline" size="sm" onClick={resetChecklist}>
            Reset Checklist
          </Button>
        </CardFooter>
      </Card>
      
      {/* Active Category Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">
            {activeCategory} {activeCategory === "southAfrican" ? "Specific Elements" : ""}
          </CardTitle>
          <CardDescription>
            {activeCategory === "essentials" && "Must-have elements for any South African CV"}
            {activeCategory === "formatting" && "Appearance and layout considerations for professional presentation"}
            {activeCategory === "content" && "Quality and relevance of information in your CV"}
            {activeCategory === "southAfrican" && "Elements specific to the South African job market context"}
            {activeCategory === "additional" && "Optional elements that can strengthen your CV"}
            {activeCategory === "redFlags" && "Common mistakes to avoid in your CV"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cvChecklist[activeCategory as keyof typeof cvChecklist]?.map(item => (
              <div 
                key={item.id} 
                className={`p-4 rounded-lg border ${
                  checkedItems[item.id] ? "bg-green-50 border-green-200" : "bg-background"
                }`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    <Checkbox 
                      id={item.id} 
                      checked={checkedItems[item.id] || false}
                      onCheckedChange={(checked) => handleCheckItem(item.id, checked as boolean)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Label 
                        htmlFor={item.id} 
                        className="font-medium text-base cursor-pointer"
                      >
                        {item.label}
                      </Label>
                      <Badge 
                        variant={
                          item.importance === "critical" ? "destructive" : 
                          item.importance === "high" ? "default" : 
                          "outline"
                        }
                        className={
                          item.importance === "high" ? "bg-amber-500" : ""
                        }
                      >
                        {item.importance}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    
                    <div className="mt-3 space-y-2 bg-slate-50 p-3 rounded-md">
                      <div className="flex items-start">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2 shrink-0" />
                        <p className="text-xs text-slate-700">
                          <span className="font-medium">South African Context: </span> 
                          {item.saContext}
                        </p>
                      </div>
                      <div className="flex items-start">
                        <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 mr-2 shrink-0" />
                        <p className="text-xs text-slate-700">
                          <span className="font-medium">Pro Tip: </span> 
                          {item.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* South African Expert Tips */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Expert Tips for South African CVs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {saExpertTips.map((tip, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <div className="mr-2 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                    {tip.icon}
                  </div>
                  {tip.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Final Reminders */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Final Review Checklist</h2>
        <Card>
          <CardHeader>
            <CardTitle>Before You Submit</CardTitle>
            <CardDescription>Complete these final checks before sending your CV</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Check file name and format</p>
                  <p className="text-sm text-muted-foreground">Name your file professionally (e.g., "FirstName_LastName_CV.pdf") and save as PDF</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Proofread one more time</p>
                  <p className="text-sm text-muted-foreground">Read through your entire CV one final time, checking for any errors or typos</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Check ATS compatibility</p>
                  <p className="text-sm text-muted-foreground">Ensure your CV uses standard headings and keywords from the job description</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Verify contact information</p>
                  <p className="text-sm text-muted-foreground">Double-check your phone number, email, and LinkedIn URL are correct</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Review tailoring for the specific role</p>
                  <p className="text-sm text-muted-foreground">Ensure you've customized your CV for this specific position and company</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CVChecklistPage;