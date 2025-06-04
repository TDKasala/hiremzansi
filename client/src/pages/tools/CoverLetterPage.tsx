import React, { useState } from 'react';
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Copy, 
  Download, 
  Lock, 
  CheckCircle,
  ClipboardList,
  User,
  Building,
  FileEdit,
  ArrowRight
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Example templates for different industries
const coverLetterTemplates = {
  "tech": `Dear [Hiring Manager],

I am writing to express my interest in the [Position] role at [Company Name]. With [X years] of experience in software development and a strong background in [technologies/skills], I believe I would be a valuable addition to your team.

In my previous role at [Previous Company], I successfully [achievement 1] and [achievement 2], which resulted in [positive outcome]. These experiences have equipped me with the skills necessary to excel in a fast-paced tech environment like [Company Name].

What particularly attracts me to [Company Name] is your commitment to [company value/initiative] and your innovative approach to [relevant industry trend]. I am excited about the opportunity to contribute to [specific project or company goal].

I appreciate your consideration and look forward to discussing how my skills and experience align with your needs.

Sincerely,
[Your Name]`,

  "finance": `Dear [Hiring Manager],

I am writing to apply for the [Position] position at [Company Name] as advertised on [job board/company website]. With my background in [relevant financial field] and experience in the South African financial sector, I believe I am well-suited for this role.

During my time at [Previous Company], I [specific achievement] which [positive result, preferably with metrics]. I have developed strong skills in [relevant skills] and have maintained a commitment to [relevant value/quality].

[Company Name]'s reputation for [company strength] and your focus on [company initiative/value] align perfectly with my professional goals. I am particularly interested in contributing to [specific department/project].

I have attached my CV detailing my qualifications and experience. I would welcome the opportunity to discuss how my background and skills would benefit your team.

Sincerely,
[Your Name]`,

  "healthcare": `Dear [Hiring Manager],

I am writing to express my interest in the [Position] position at [Healthcare Institution]. As a healthcare professional with [X years] of experience and a passion for patient care, I am excited about the opportunity to join your esteemed organization.

In my current role at [Current/Previous Institution], I have focused on [specific responsibilities], resulting in [positive outcomes for patients/institution]. I have also contributed to [specific initiatives or improvements] that enhanced the quality of care provided to patients.

I am particularly drawn to [Healthcare Institution] because of your commitment to [specific aspect of healthcare/value]. Your reputation for [positive attribute] aligns with my personal and professional values.

I would welcome the chance to discuss how my experience and dedication to excellence in healthcare can contribute to your team.

Sincerely,
[Your Name]`,

  "education": `Dear [Principal/Hiring Committee],

I am writing to apply for the [Teaching Position] at [School/Institution]. As an educator with [X years] of experience and a strong commitment to student success, I am excited about the opportunity to join your academic community.

My teaching philosophy centers on [brief description of philosophy], and I have implemented this approach successfully at [Previous School/Institution]. Some highlights of my teaching career include [achievement 1] and [achievement 2], which have contributed to [positive outcome for students].

I am particularly impressed by [School/Institution]'s approach to [educational aspect/program] and would be enthusiastic about contributing to your [specific department/initiative]. My qualifications include [relevant qualification] and experience teaching [subjects/grades].

I look forward to the possibility of discussing how I can contribute to your educational mission in South Africa.

Sincerely,
[Your Name]`,

  "general": `Dear [Hiring Manager],

I am writing to express my interest in the [Position] role at [Company Name] as advertised on [job board/company website]. With my background in [relevant field] and [X years] of experience, I am confident in my ability to make a valuable contribution to your team.

In my current position at [Current/Previous Company], I have developed strong skills in [key skills] and have successfully [significant achievement]. This experience has prepared me well for the challenges and opportunities at [Company Name].

What attracts me to this position is [specific aspect of the role or company]. I am particularly impressed by [company attribute/achievement] and am excited about the possibility of contributing to [company goal/project].

I have attached my CV for your review and would welcome the opportunity to discuss how my experience aligns with your needs.

Sincerely,
[Your Name]`
};

export default function CoverLetterPage() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState('general');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [letter, setLetter] = useState(coverLetterTemplates.general);
  const [isSubscribed, setIsSubscribed] = useState(false); // This would typically come from a user subscription check

  const handleGenerateLetter = () => {
    let newLetter = coverLetterTemplates[selectedTemplate as keyof typeof coverLetterTemplates];
    
    // Replace placeholders with user input
    if (company) {
      newLetter = newLetter.replace(/\[Company Name\]/g, company);
    }
    
    if (position) {
      newLetter = newLetter.replace(/\[Position\]/g, position);
    }
    
    setLetter(newLetter);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(letter);
    alert('Cover letter copied to clipboard!');
  };

  const handleDownloadLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([letter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${company || 'Company'}_${position || 'Position'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <>
      <Helmet>
        <title>Cover Letter Generator | Hire Mzansi</title>
        <meta 
          name="description" 
          content="Create professional, customized cover letters for South African job applications with our easy-to-use cover letter generator." 
        />
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">South African Cover Letter Generator</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create professional cover letters tailored to South African industries and job requirements
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Cover Letter Generator Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileEdit className="mr-2 h-5 w-5 text-primary" />
                  Cover Letter Details
                </CardTitle>
                <CardDescription>
                  Fill in the details to generate your cover letter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry Template</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="finance">Finance & Banking</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="general">General Purpose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                      Company Name
                    </label>
                    <Input 
                      placeholder="e.g., Standard Bank" 
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" />
                      Position
                    </label>
                    <Input 
                      placeholder="e.g., Software Developer" 
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    Your Name
                  </label>
                  <Input placeholder="Your full name" defaultValue={user?.name || ''} />
                </div>
                
                <Button 
                  onClick={handleGenerateLetter} 
                  className="w-full"
                >
                  Generate Cover Letter
                </Button>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <Card className="bg-primary/5 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    Cover Letter Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="format">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="format">Format</TabsTrigger>
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="sa-tips">SA Tips</TabsTrigger>
                    </TabsList>
                    <TabsContent value="format" className="pt-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                          <span>Keep it to one page (3-4 paragraphs)</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                          <span>Use a professional, clean font</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                          <span>Include your contact information at the top</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                          <span>Match the formatting of your CV for consistency</span>
                        </li>
                      </ul>
                    </TabsContent>
                    <TabsContent value="content" className="pt-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                          <span>Address the hiring manager by name when possible</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                          <span>Highlight achievements with measurable results</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                          <span>Show you've researched the company</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                          <span>Close with a clear call to action</span>
                        </li>
                      </ul>
                    </TabsContent>
                    <TabsContent value="sa-tips" className="pt-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                          <span>Mention your B-BBEE status if applicable</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                          <span>Include NQF levels for qualifications</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                          <span>Highlight language skills relevant to the region</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                          <span>Reference understanding of local market challenges</span>
                        </li>
                      </ul>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Cover Letter Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Your Cover Letter
                </CardTitle>
                <CardDescription>
                  Preview, edit, and download your cover letter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  className="h-[500px] font-mono text-sm whitespace-pre-wrap"
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center">
                <div className="flex space-x-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    onClick={handleCopyToClipboard}
                    className="flex-1 sm:flex-none"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button 
                    onClick={handleDownloadLetter}
                    className="flex-1 sm:flex-none"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                
                {!isSubscribed && (
                  <div className="mt-4 sm:mt-0 bg-amber-50 text-amber-900 border border-amber-200 p-2 rounded-md flex items-center">
                    <Lock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="flex items-center text-xs">
                      <span>Upgrade to create unlimited cover letters</span>
                      <Button variant="link" asChild size="sm" className="h-auto p-0 ml-1">
                        <a href="/pricing" className="flex items-center text-amber-900">
                          <span className="underline">Upgrade</span>
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>

            <div className="mt-6">
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Pro Cover Letter Tips</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm mb-4">
                    Did you know that 45% of South African recruiters read the cover letter before looking at your CV? Make it count!
                  </p>
                  
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <p className="font-medium">Expert Advice:</p>
                    <p className="text-muted-foreground">Customize each cover letter by researching the company's specific needs and culture. Show how your skills directly address their challenges.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}