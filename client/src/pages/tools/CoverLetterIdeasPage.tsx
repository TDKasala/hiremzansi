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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, ClipboardCopy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Instead of importing the document directly, we'll handle it as a download link
const COVER_LETTER_DOWNLOAD_URL = '/cover-letter-templates.docx';

const CoverLetterIdeasPage: React.FC = () => {
  const { toast } = useToast();
  const [industry, setIndustry] = useState<string>("");
  
  const downloadTemplates = () => {
    // In a real implementation, this would be served from a public folder or API
    toast({
      title: "Download started",
      description: "The document will download shortly"
    });
    
    // Simulating download link for templates
    window.open(COVER_LETTER_DOWNLOAD_URL, '_blank');
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to your clipboard"
      });
    }).catch(err => {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive"
      });
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-10">
      <Helmet>
        <title>Cover Letter Ideas | ATSBoost</title>
        <meta 
          name="description" 
          content="Get industry-specific cover letter templates and prompts tailored for South African employers."
        />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center">
            <FileText className="mr-3 h-8 w-8 text-primary" />
            South African Cover Letter Ideas
          </h1>
          <p className="text-muted-foreground mt-2">
            Templates and guidance for writing effective cover letters for the South African job market
          </p>
        </div>
        
        <Tabs defaultValue="templates" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="industry">Industry-Specific</TabsTrigger>
            <TabsTrigger value="structure">Structure Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="mt-6">
            <Card className="mb-8">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Cover Letter Templates</CardTitle>
                    <CardDescription>Ready-to-use templates for different career stages</CardDescription>
                  </div>
                  <Button onClick={downloadTemplates} className="flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Download All Templates
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border border-primary/20">
                    <CardHeader className="bg-primary/5 pb-3">
                      <CardTitle className="text-lg">Entry Level Template</CardTitle>
                      <CardDescription>For recent graduates or those with limited experience</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 pb-2">
                      <div className="text-sm text-muted-foreground">
                        <p>This template emphasizes:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Educational qualifications</li>
                          <li>Internships and volunteer work</li>
                          <li>Eagerness to learn and grow</li>
                          <li>Relevant coursework and projects</li>
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={downloadTemplates}>
                        View Template
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border border-primary/20">
                    <CardHeader className="bg-primary/5 pb-3">
                      <CardTitle className="text-lg">Experienced Professional</CardTitle>
                      <CardDescription>For professionals with 5+ years of experience</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 pb-2">
                      <div className="text-sm text-muted-foreground">
                        <p>This template emphasizes:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Quantifiable achievements</li>
                          <li>Leadership experience</li>
                          <li>Industry expertise</li>
                          <li>Targeted skills for the specific role</li>
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={downloadTemplates}>
                        View Template
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border border-primary/20">
                    <CardHeader className="bg-primary/5 pb-3">
                      <CardTitle className="text-lg">Career Change Template</CardTitle>
                      <CardDescription>For professionals transitioning to a new field</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 pb-2">
                      <div className="text-sm text-muted-foreground">
                        <p>This template emphasizes:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Transferable skills</li>
                          <li>Relevant projects or education</li>
                          <li>Motivation for the career change</li>
                          <li>Adaptability and quick learning</li>
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={downloadTemplates}>
                        View Template
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="border border-primary/20">
                    <CardHeader className="bg-primary/5 pb-3">
                      <CardTitle className="text-lg">Executive Level Template</CardTitle>
                      <CardDescription>For senior management and C-suite positions</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 pb-2">
                      <div className="text-sm text-muted-foreground">
                        <p>This template emphasizes:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Strategic vision and leadership</li>
                          <li>Corporate transformation experience</li>
                          <li>Business development achievements</li>
                          <li>B-BBEE and transformation expertise</li>
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={downloadTemplates}>
                        View Template
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="industry" className="mt-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Industry-Specific Cover Letter Examples</CardTitle>
                <CardDescription>
                  Select an industry to see tailored cover letter examples for the South African market
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select onValueChange={setIndustry} value={industry}>
                  <SelectTrigger className="mb-6">
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finance">Finance & Banking</SelectItem>
                    <SelectItem value="tech">Information Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="mining">Mining & Resources</SelectItem>
                    <SelectItem value="retail">Retail & Hospitality</SelectItem>
                    <SelectItem value="government">Government & Public Sector</SelectItem>
                  </SelectContent>
                </Select>
                
                {industry === "finance" && (
                  <div className="bg-muted/30 p-5 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-lg">Finance & Banking Cover Letter Example</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center"
                        onClick={() => copyToClipboard(financeExample)}
                      >
                        <ClipboardCopy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="text-sm border p-4 rounded bg-white">
                      <p className="font-semibold mb-4">[Your Name]<br />[Your Address]<br />[City, Province, Postal Code]<br />[Your Email]<br />[Your Phone Number]<br />[LinkedIn Profile]</p>
                      
                      <p className="mb-2">[Date]</p>
                      
                      <p className="mb-4">[Recipient's Name]<br />[Their Position]<br />[Company Name]<br />[Company Address]<br />[City, Province, Postal Code]</p>
                      
                      <p className="mb-2">Dear [Mr./Ms./Dr.] [Recipient's Surname],</p>
                      
                      <p className="mb-3">I am writing to express my interest in the [specific position] role at [Bank/Financial Institution Name], as advertised on [where you found the position]. With [X] years of experience in South Africa's financial sector and strong expertise in [mention key skills like risk analysis, regulatory compliance, portfolio management, etc.], I am confident in my ability to contribute significantly to your team.</p>
                      
                      <p className="mb-3">At [Your Current/Previous Company], I successfully [specific achievement relevant to finance, e.g., "implemented cost-saving measures that reduced operational expenses by 15%" or "managed a portfolio valued at R50 million with a year-on-year growth of 12%"]. My experience with South Africa's financial regulatory framework, including FAIS, FICA, and the Banks Act, has equipped me with the knowledge needed to navigate the complex compliance landscape while driving business growth.</p>
                      
                      <p className="mb-3">I am particularly drawn to [Company Name] because of your [mention something specific about the company that appeals to you, e.g., "innovative approach to digital banking solutions" or "commitment to financial inclusion across Southern Africa"]. Your recent [mention a recent project, initiative, or achievement of the company] aligns perfectly with my professional interests and expertise in [relevant skill or interest].</p>
                      
                      <p className="mb-3">I hold a [your qualification] in [field] from [University], and I have supplemented this with [relevant certifications, e.g., CFA, ACCA, etc.]. I am also experienced in [mention relevant financial software or systems commonly used in South Africa, e.g., "Bloomberg terminals, Pastel Evolution, and SAP Finance"].</p>
                      
                      <p className="mb-3">I am excited about the possibility of bringing my skills, experience, and passion for financial excellence to [Company Name]. I would welcome the opportunity to discuss how my background aligns with your needs and how I can contribute to your continued success.</p>
                      
                      <p className="mb-3">Thank you for considering my application. I look forward to the possibility of discussing this opportunity with you further.</p>
                      
                      <p>Sincerely,<br />[Your Name]</p>
                    </div>
                  </div>
                )}
                
                {industry === "tech" && (
                  <div className="bg-muted/30 p-5 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-lg">Information Technology Cover Letter Example</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center"
                        onClick={() => copyToClipboard(techExample)}
                      >
                        <ClipboardCopy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="text-sm border p-4 rounded bg-white">
                      <p className="font-semibold mb-4">[Your Name]<br />[Your Address]<br />[City, Province, Postal Code]<br />[Your Email]<br />[Your Phone Number]<br />[GitHub/LinkedIn Profile]</p>
                      
                      <p className="mb-2">[Date]</p>
                      
                      <p className="mb-4">[Recipient's Name]<br />[Their Position]<br />[Company Name]<br />[Company Address]<br />[City, Province, Postal Code]</p>
                      
                      <p className="mb-2">Dear [Mr./Ms./Dr.] [Recipient's Surname],</p>
                      
                      <p className="mb-3">I am writing to apply for the position of [Position Title] at [Company Name], as advertised on [where you saw the job]. As a [your current position] with [X] years of experience in the South African tech industry, I am excited about the opportunity to bring my expertise in [mention key technical skills, e.g., "full-stack development, cloud infrastructure, and cybersecurity"] to your innovative team.</p>
                      
                      <p className="mb-3">In my current role at [Current/Previous Company], I successfully [describe a significant achievement, e.g., "developed and implemented a customer portal that increased user engagement by 40% and reduced support tickets by 25%"]. I've worked extensively with [mention relevant technologies, e.g., "React, Node.js, AWS, and SQL/NoSQL databases"], and I have experience adapting solutions to work reliably within South Africa's unique infrastructure challenges, including load shedding resilience and bandwidth optimization.</p>
                      
                      <p className="mb-3">I am particularly impressed by [Company Name]'s [mention something specific about the company that interests you, e.g., "focus on developing homegrown tech solutions for African markets" or "innovative approach to addressing financial inclusion through technology"]. Your recent project [mention a specific project of the company] resonates with my professional interest in [relevant interest area].</p>
                      
                      <p className="mb-3">I hold a [your qualification] in [field] from [University], and have further enhanced my skills through [mention relevant certifications or additional training]. I am committed to continuous learning and staying current with emerging technologies that can solve real problems in the South African context.</p>
                      
                      <p className="mb-3">Beyond technical skills, I bring strong communication abilities, having frequently [mention relevant soft skills, e.g., "served as the bridge between technical and non-technical stakeholders" or "led agile development teams across multiple projects"]. I understand the importance of developing solutions that consider South Africa's diverse user base and varying levels of digital literacy.</p>
                      
                      <p className="mb-3">I am excited about the prospect of contributing to [Company Name]'s continued success and would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application.</p>
                      
                      <p>Sincerely,<br />[Your Name]</p>
                    </div>
                  </div>
                )}
                
                {/* Add more industries as needed */}
                
                {!industry && (
                  <div className="text-center py-10 text-muted-foreground">
                    <p>Select an industry to view a sample cover letter</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="structure" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Cover Letter Structure Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">1. Contact Information</h3>
                    <div className="text-sm space-y-2">
                      <p>Include at the top of your letter:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Your full name</li>
                        <li>Physical address</li>
                        <li>Phone number (with country code +27)</li>
                        <li>Professional email address</li>
                        <li>LinkedIn profile URL (optional)</li>
                        <li>Date</li>
                        <li>Recipient's information (name, title, company, address)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">2. Salutation</h3>
                    <div className="text-sm space-y-2">
                      <p>Address the hiring manager by name whenever possible:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Research to find the correct name of the recipient</li>
                        <li>Use "Dear Mr./Ms./Dr. [Last Name],"</li>
                        <li>If you can't find a name, use "Dear Hiring Manager," or "Dear [Department] Team,"</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">3. Opening Paragraph</h3>
                    <div className="text-sm space-y-2">
                      <p>State the purpose of your letter clearly:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Specify the position you're applying for</li>
                        <li>Mention where you found the job listing</li>
                        <li>Include a brief statement about why you're interested</li>
                        <li>For South African context, mention any relevant connection to the company's industry or geographic focus</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">4. Body Paragraphs</h3>
                    <div className="text-sm space-y-2">
                      <p>Use 1-2 paragraphs to showcase your qualifications:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Highlight relevant experience and accomplishments</li>
                        <li>Quantify achievements with specific numbers when possible</li>
                        <li>Connect your skills to the job requirements</li>
                        <li>Mention skills particularly valuable in the South African context (e.g., adaptability, cross-cultural communication)</li>
                        <li>Address any important South African specific qualifications (NQF level, B-BBEE status if relevant)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">5. Company-Specific Paragraph</h3>
                    <div className="text-sm space-y-2">
                      <p>Demonstrate your knowledge of the company:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Research the company thoroughly</li>
                        <li>Explain why you want to work specifically for this company</li>
                        <li>Connect your values to the company's mission</li>
                        <li>Mention recent developments or achievements of the company</li>
                        <li>Show understanding of South African market challenges in their industry</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">6. Closing Paragraph</h3>
                    <div className="text-sm space-y-2">
                      <p>Conclude with a call to action:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Express enthusiasm for the opportunity</li>
                        <li>Request an interview or next steps</li>
                        <li>Thank the reader for their consideration</li>
                        <li>Provide your availability or flexibility for interviews</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">7. Formal Closing</h3>
                    <div className="text-sm space-y-2">
                      <p>End with a professional closing:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Use "Sincerely," "Kind regards," or "Yours faithfully,"</li>
                        <li>Leave space for a handwritten signature (if printed)</li>
                        <li>Type your full name below</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="bg-muted/30 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
            South African Cover Letter Tips
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-primary">Do's</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Customize each letter for the specific position and company</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Mention your B-BBEE status if it's relevant to the position</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Highlight experience with local regulations and market conditions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Specify your NQF level for relevant qualifications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Keep your cover letter to one page (3-4 paragraphs)</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-primary">Don'ts</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Don't use generic templates without customization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Avoid overly casual language or slang</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Don't focus only on what you want from the employer</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Don't repeat your entire CV in paragraph form</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Avoid discussing salary expectations unless specifically requested</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example cover letters for copy functionality
const financeExample = `[Your Name]
[Your Address]
[City, Province, Postal Code]
[Your Email]
[Your Phone Number]
[LinkedIn Profile]

[Date]

[Recipient's Name]
[Their Position]
[Company Name]
[Company Address]
[City, Province, Postal Code]

Dear [Mr./Ms./Dr.] [Recipient's Surname],

I am writing to express my interest in the [specific position] role at [Bank/Financial Institution Name], as advertised on [where you found the position]. With [X] years of experience in South Africa's financial sector and strong expertise in [mention key skills like risk analysis, regulatory compliance, portfolio management, etc.], I am confident in my ability to contribute significantly to your team.

At [Your Current/Previous Company], I successfully [specific achievement relevant to finance, e.g., "implemented cost-saving measures that reduced operational expenses by 15%" or "managed a portfolio valued at R50 million with a year-on-year growth of 12%"]. My experience with South Africa's financial regulatory framework, including FAIS, FICA, and the Banks Act, has equipped me with the knowledge needed to navigate the complex compliance landscape while driving business growth.

I am particularly drawn to [Company Name] because of your [mention something specific about the company that appeals to you, e.g., "innovative approach to digital banking solutions" or "commitment to financial inclusion across Southern Africa"]. Your recent [mention a recent project, initiative, or achievement of the company] aligns perfectly with my professional interests and expertise in [relevant skill or interest].

I hold a [your qualification] in [field] from [University], and I have supplemented this with [relevant certifications, e.g., CFA, ACCA, etc.]. I am also experienced in [mention relevant financial software or systems commonly used in South Africa, e.g., "Bloomberg terminals, Pastel Evolution, and SAP Finance"].

I am excited about the possibility of bringing my skills, experience, and passion for financial excellence to [Company Name]. I would welcome the opportunity to discuss how my background aligns with your needs and how I can contribute to your continued success.

Thank you for considering my application. I look forward to the possibility of discussing this opportunity with you further.

Sincerely,
[Your Name]`;

const techExample = `[Your Name]
[Your Address]
[City, Province, Postal Code]
[Your Email]
[Your Phone Number]
[GitHub/LinkedIn Profile]

[Date]

[Recipient's Name]
[Their Position]
[Company Name]
[Company Address]
[City, Province, Postal Code]

Dear [Mr./Ms./Dr.] [Recipient's Surname],

I am writing to apply for the position of [Position Title] at [Company Name], as advertised on [where you saw the job]. As a [your current position] with [X] years of experience in the South African tech industry, I am excited about the opportunity to bring my expertise in [mention key technical skills, e.g., "full-stack development, cloud infrastructure, and cybersecurity"] to your innovative team.

In my current role at [Current/Previous Company], I successfully [describe a significant achievement, e.g., "developed and implemented a customer portal that increased user engagement by 40% and reduced support tickets by 25%"]. I've worked extensively with [mention relevant technologies, e.g., "React, Node.js, AWS, and SQL/NoSQL databases"], and I have experience adapting solutions to work reliably within South Africa's unique infrastructure challenges, including load shedding resilience and bandwidth optimization.

I am particularly impressed by [Company Name]'s [mention something specific about the company that interests you, e.g., "focus on developing homegrown tech solutions for African markets" or "innovative approach to addressing financial inclusion through technology"]. Your recent project [mention a specific project of the company] resonates with my professional interest in [relevant interest area].

I hold a [your qualification] in [field] from [University], and have further enhanced my skills through [mention relevant certifications or additional training]. I am committed to continuous learning and staying current with emerging technologies that can solve real problems in the South African context.

Beyond technical skills, I bring strong communication abilities, having frequently [mention relevant soft skills, e.g., "served as the bridge between technical and non-technical stakeholders" or "led agile development teams across multiple projects"]. I understand the importance of developing solutions that consider South Africa's diverse user base and varying levels of digital literacy.

I am excited about the prospect of contributing to [Company Name]'s continued success and would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application.

Sincerely,
[Your Name]`;

export default CoverLetterIdeasPage;