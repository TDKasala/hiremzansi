import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { FileText, Copy, Sparkles, Download, ArrowRight, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Cover letter templates for different industries and positions
const coverLetterTemplates = [
  {
    id: "standard",
    name: "Professional Standard",
    description: "A clean, professional cover letter suitable for most industries",
    industry: "General",
    template: `[Your Full Name]
[Your Address]
[City, Province, Postal Code]
[Your Email]
[Your Phone Number]

[Date]

[Recipient's Name]
[Their Job Title]
[Company Name]
[Company Address]
[City, Province, Postal Code]

Dear [Recipient's Name],

RE: Application for [Position Title] (Reference: [Job Reference Number if applicable])

I am writing to express my interest in the [Position Title] position advertised on [where you saw the job posting]. With [X] years of experience in [relevant field/industry] and a proven track record of [key achievement relevant to the role], I am confident in my ability to contribute effectively to [Company Name].

Through my role at [Current/Previous Company], I have developed extensive expertise in [relevant skill/responsibility #1], [relevant skill/responsibility #2], and [relevant skill/responsibility #3]. My accomplishments include [specific, quantifiable achievement].

I am particularly drawn to [Company Name] because of [something specific about the company that genuinely interests you, such as their innovative approach, company values, recent projects, etc.]. I am excited about the opportunity to bring my [specific skills or experiences] to your team and contribute to [specific company goal or project].

I hold a [Your Qualification] from [Institution Name] (NQF Level [X]) and have also completed [relevant additional qualification or certification]. Throughout my career, I have demonstrated [key soft skills relevant to the position] and have been recognized for [any awards or recognition].

I am [mention any relevant South African context, such as B-BBEE status, citizenship status, availability, willingness to relocate if applicable].

Thank you for considering my application. I welcome the opportunity to discuss how my skills and experience align with your requirements. I look forward to the possibility of contributing to [Company Name]'s continued success.

Yours sincerely,

[Your Name]`,
    tips: [
      "Include the job reference number if there is one",
      "Keep it to one page only",
      "Address to a specific person whenever possible",
      "Include relevant South African qualifications (NQF levels)",
      "Mention B-BBEE status if relevant to the position",
      "Highlight 2-3 specific achievements with measurable results",
    ]
  },
  {
    id: "graduate",
    name: "Recent Graduate",
    description: "Perfect for those with limited work experience but relevant qualifications",
    industry: "Entry-level",
    template: `[Your Full Name]
[Your Address]
[City, Province, Postal Code]
[Your Email]
[Your Phone Number]

[Date]

[Recipient's Name]
[Their Job Title]
[Company Name]
[Company Address]
[City, Province, Postal Code]

Dear [Recipient's Name],

RE: Application for [Position Title] (Reference: [Job Reference Number if applicable])

I am writing to apply for the position of [Position Title] as advertised on [where you saw the job posting]. As a recent graduate with a [Your Qualification] (NQF Level [X]) from [Institution Name], I am eager to begin my career with a forward-thinking organization like [Company Name].

Throughout my studies, I developed strong skills in [relevant skill #1], [relevant skill #2], and [relevant skill #3], which I believe make me well-suited for this role. During my final year, I completed a project on [relevant project], which involved [brief description of what you did and skills used].

I have also gained practical experience through [internship/part-time job/volunteer work] at [Organization], where I [brief description of responsibilities and achievements]. This experience taught me [what you learned that's relevant to the role].

What attracts me to [Company Name] is [something specific about the company that genuinely interests you]. I am particularly excited about the opportunity to [what you hope to do or learn in the role].

As a [mention any relevant South African context, such as young professional, graduate, B-BBEE status, etc.], I am committed to contributing to South Africa's growing [industry] sector and believe that [Company Name] provides the ideal environment to start my career journey.

I am available for an interview at your convenience and look forward to discussing how I can contribute to your team.

Thank you for considering my application.

Yours sincerely,

[Your Name]`,
    tips: [
      "Emphasize academic achievements and relevant coursework",
      "Highlight university projects related to the job",
      "Include relevant internships or volunteer experience",
      "Mention computer skills and software proficiencies",
      "Emphasize soft skills: adaptability, eagerness to learn",
      "Reference any involvement in university organizations"
    ]
  },
  {
    id: "tech",
    name: "Technology Professional",
    description: "Tailored for IT, software development, and tech-related positions",
    industry: "Technology",
    template: `[Your Full Name]
[Your Address]
[City, Province, Postal Code]
[Your Email]
[Your Phone Number]
[Your LinkedIn/GitHub Profile]

[Date]

[Recipient's Name]
[Their Job Title]
[Company Name]
[Company Address]
[City, Province, Postal Code]

Dear [Recipient's Name],

RE: Application for [Position Title] (Reference: [Job Reference Number if applicable])

I am writing to express my interest in the [Position Title] position at [Company Name] as advertised on [where you saw the job posting]. With [X] years of experience in [specific tech field] and expertise in [relevant technologies/programming languages/frameworks], I am excited about the opportunity to bring my technical skills to your innovative team.

In my current role as [Current Position] at [Current Company], I have:
• Developed and implemented [specific technical project/solution], resulting in [quantifiable outcome, e.g., 30% performance improvement]
• Collaborated with cross-functional teams to [specific achievement], using [relevant technologies]
• Led the [specific initiative/project], delivering [specific results]

I hold a [Your Qualification] from [Institution Name] (NQF Level [X]) and have also obtained certifications in [relevant certifications, e.g., AWS Solutions Architect, MCSE, etc.]. My technical skills include proficiency in [list relevant programming languages, frameworks, tools, and methodologies].

I am particularly drawn to [Company Name] because of [something specific about the company's technology, projects, or technical innovation]. I have been following your work on [specific project or product] and am impressed by [specific aspect].

The South African tech industry is experiencing significant growth, and I am keen to contribute to this momentum by bringing my skills in [specific technical skills relevant to SA market needs] to your organization.

I have attached my CV detailing my experience and would welcome the opportunity to discuss how my technical expertise aligns with your requirements. I am available for a technical interview or coding assessment at your convenience.

Thank you for considering my application. I look forward to the possibility of contributing to [Company Name]'s technical excellence.

Sincerely,

[Your Name]`,
    tips: [
      "Include links to your GitHub profile or portfolio",
      "List specific technologies and programming languages",
      "Mention specific tech certifications",
      "Reference understanding of current South African tech landscape",
      "Quantify achievements with specific metrics",
      "Demonstrate knowledge of the company's tech stack"
    ]
  },
  {
    id: "finance",
    name: "Finance Professional",
    description: "Designed for accounting, banking, and financial services positions",
    industry: "Finance",
    template: `[Your Full Name]
[Your Address]
[City, Province, Postal Code]
[Your Email]
[Your Phone Number]

[Date]

[Recipient's Name]
[Their Job Title]
[Company Name]
[Company Address]
[City, Province, Postal Code]

Dear [Recipient's Name],

RE: Application for [Position Title] (Reference: [Job Reference Number if applicable])

I am writing to apply for the [Position Title] position at [Company Name] as advertised on [where you saw the job posting]. As a qualified [Your Professional Designation, e.g., CA(SA), ACCA, CIMA] with [X] years of experience in [specific finance area], I am excited about the opportunity to bring my financial expertise to your organization.

Through my current role as [Current Position] at [Current Company], I have:
• Managed [specific financial responsibility, e.g., financial reporting, auditing, tax compliance] for [scope of responsibility]
• Improved [specific financial process], resulting in [quantifiable outcome, e.g., cost savings, efficiency improvement]
• Ensured compliance with [relevant financial regulations, e.g., IFRS, Companies Act, tax legislation]

I hold a [Your Qualification] from [Institution Name] (NQF Level [X]) and am a member in good standing with [relevant professional body, e.g., SAICA, SAIPA]. I have extensive knowledge of [relevant financial software, e.g., SAP, Oracle Financials] and am proficient in [other relevant skills].

What attracts me to [Company Name] is [something specific about the company's financial approach, market position, or values]. I am particularly interested in your [specific aspect of the company's financial operations or recent developments].

I am well-versed in South Africa's financial landscape, including [relevant aspects, e.g., B-BBEE financial reporting requirements, JSE regulations for listed companies, SARS compliance]. This knowledge would enable me to contribute effectively to your financial operations from day one.

I would welcome the opportunity to discuss how my financial expertise can benefit [Company Name]. Thank you for considering my application.

Yours sincerely,

[Your Name]
[Professional Designation, e.g., CA(SA)]`,
    tips: [
      "Include professional designations (CA(SA), ACCA, etc.)",
      "Mention professional body memberships",
      "Reference understanding of South African financial regulations",
      "Specify experience with financial software",
      "Highlight compliance knowledge (IFRS, GAAP, Companies Act)",
      "Demonstrate understanding of B-BBEE financial implications"
    ]
  },
  {
    id: "healthcare",
    name: "Healthcare Professional",
    description: "For medical, nursing, and allied health professional positions",
    industry: "Healthcare",
    template: `[Your Full Name]
[Your Address]
[City, Province, Postal Code]
[Your Email]
[Your Phone Number]
[Your Professional Registration Number]

[Date]

[Recipient's Name]
[Their Job Title]
[Hospital/Clinic/Organization Name]
[Address]
[City, Province, Postal Code]

Dear [Recipient's Name],

RE: Application for [Position Title] (Reference: [Job Reference Number if applicable])

I am writing to express my interest in the [Position Title] position at [Hospital/Clinic/Organization Name] as advertised on [where you saw the job posting]. As a registered [Your Profession] with [X] years of experience in [specific healthcare area], I am committed to providing high-quality patient care and contributing to healthcare delivery in South Africa.

In my current role at [Current Employer], I have:
• Provided care for [patient population or specialty area]
• Contributed to [specific healthcare initiative or improvement]
• Collaborated with multidisciplinary teams to [specific achievement]

I hold a [Your Qualification] from [Institution Name] (NQF Level [X]) and am registered with the [Relevant Professional Council, e.g., HPCSA, SANC] (Registration Number: [Your Registration Number]). I have also completed specialized training in [relevant specialized training or certifications].

I am particularly drawn to [Hospital/Clinic/Organization Name] because of [something specific about the organization's approach to healthcare, reputation, or values]. I am excited about the opportunity to contribute to your commitment to [specific aspect of their healthcare delivery or mission].

As a healthcare professional in South Africa, I understand the unique challenges and opportunities in our healthcare system. I am passionate about [specific aspect of healthcare relevant to South Africa, e.g., improving access to care, public health initiatives, addressing healthcare disparities].

I would welcome the opportunity to discuss how my clinical experience and dedication to patient care align with your requirements. Thank you for considering my application.

Yours sincerely,

[Your Name]
[Your Professional Designation]
[Registration Number]`,
    tips: [
      "Include your professional registration number (HPCSA, SANC, etc.)",
      "Mention specific clinical skills and specialties",
      "Reference understanding of South African healthcare challenges",
      "Highlight experience with specific patient populations",
      "Include specialized certifications or additional training",
      "Demonstrate knowledge of relevant healthcare regulations"
    ]
  }
];

// Powerful opening lines for cover letters
const openingLines = [
  "With over [X] years of experience delivering exceptional results in [industry/field], I was excited to discover the [Position] opportunity at [Company].",
  "As a passionate [profession] with a proven track record of [key achievement], I am writing to express my interest in the [Position] role with [Company].",
  "Your recent project on [specific company initiative] caught my attention, and I am eager to contribute my expertise in [your skill] to your innovative team.",
  "My extensive background in [specific skill/industry] aligns perfectly with the requirements outlined in your job posting for [Position].",
  "The opportunity to bring my unique combination of [skill 1] and [skill 2] to a forward-thinking organization like [Company] is what draws me to apply for this role.",
  "Having successfully [specific accomplishment relevant to the role], I am confident in my ability to deliver similar results as your next [Position].",
  "Your company's commitment to [company value/mission] resonates strongly with my professional ethos, which is why I'm particularly interested in joining [Company] as a [Position].",
  "Few things are as exciting as finding a role that perfectly matches one's skillset and passion—the [Position] at [Company] represents exactly that for me.",
  "After learning about [Company]'s recent [achievement/initiative], I am inspired to submit my application for the [Position] role.",
  "With a demonstrated ability to [key skill relevant to the job], I am eager to bring my expertise to the [Position] role at [Company]."
];

// Achievement statements for different industries
const achievementStatements = {
  technology: [
    "Developed and implemented a new CRM system that increased customer retention by 22% and streamlined sales processes for a team of 15",
    "Led a team of 5 developers in creating a mobile application that achieved over 50,000 downloads in the first month of release",
    "Reduced website loading time by 40% by optimizing backend processes and implementing modern web technologies",
    "Implemented automated testing procedures that reduced QA time by 30% and improved software reliability by 25%",
    "Migrated legacy systems to cloud infrastructure, resulting in 35% cost savings and 99.9% uptime",
    "Designed and developed API integrations that connected 3 disparate systems, eliminating 15 hours of manual data entry weekly"
  ],
  finance: [
    "Identified and resolved accounting discrepancies that resulted in R1.2 million in recovered revenue",
    "Implemented cost-saving measures that reduced departmental expenses by 18% while maintaining operational efficiency",
    "Managed a project portfolio valued at R35 million, delivering 100% of projects on time and under budget",
    "Streamlined the month-end closing process, reducing completion time from 10 days to 3 days",
    "Conducted financial analysis that identified a R2.5 million opportunity for tax optimization",
    "Developed and implemented a new financial reporting system that improved accuracy by 40% and reduced report generation time by 60%"
  ],
  healthcare: [
    "Implemented a patient care initiative that improved satisfaction scores by 28% over six months",
    "Reduced medication administration errors by 35% through the introduction of a new verification protocol",
    "Managed a department of 12 healthcare professionals while maintaining a 95% patient satisfaction rate",
    "Developed a training program for new staff that reduced onboarding time by 40% and improved competency scores",
    "Led a multidisciplinary team that reduced average patient wait times from 45 minutes to 18 minutes",
    "Implemented evidence-based protocols that reduced hospital-acquired infections by 32%"
  ],
  education: [
    "Developed a new curriculum that improved student performance on standardized tests by 27%",
    "Created an innovative teaching methodology that increased student engagement by 40% as measured by participation metrics",
    "Mentored 15 students who achieved acceptance into top university programs with scholarship offers",
    "Implemented a peer learning program that improved overall class performance by 23%",
    "Secured R250,000 in grant funding for innovative educational programs",
    "Reduced student dropout rates by 30% through the implementation of an early intervention program"
  ],
  marketing: [
    "Managed social media campaigns that increased brand engagement by 75% and generated 3,000 qualified leads",
    "Developed a content marketing strategy that boosted website traffic by 120% and reduced cost-per-acquisition by 35%",
    "Led a rebranding initiative that improved brand recognition by 45% according to market research",
    "Created email marketing campaigns with a 32% conversion rate, exceeding industry average by 4X",
    "Implemented SEO strategies that improved organic search rankings for key terms by an average of 15 positions",
    "Managed a marketing budget of R1.8 million, delivering a 280% return on investment"
  ]
};

// South African specific qualifications and context phrases
const saContextPhrases = [
  "I hold a [Qualification] certified at NQF Level [X] through SAQA",
  "As a B-BBEE Level [X] contributor, I am committed to transformation in the South African workplace",
  "My professional registration with [SAICA/HPCSA/ECSA/etc.] is current and in good standing",
  "I have extensive experience working within South Africa's [specific regulatory framework]",
  "I am proficient in [X] official South African languages, including [language names]",
  "Through my involvement with [SA organization/initiative], I have gained valuable insight into local market dynamics",
  "I am familiar with the requirements of the Employment Equity Act and have contributed to workplace diversity initiatives",
  "My understanding of South Africa's [industry-specific] landscape includes knowledge of [specific local factors]",
  "I have completed compliance training in POPIA, ensuring I understand data protection requirements in South Africa",
  "Having worked across [provinces/regions] in South Africa, I understand the unique regional business environments"
];

const CoverLetterIdeasPage = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customizations, setCustomizations] = useState({
    includeBBBEE: true,
    includeNQF: true,
    formalTone: true,
  });
  
  // Copy text to clipboard
  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: description,
    });
  };
  
  // Get the selected template
  const getTemplate = () => {
    return coverLetterTemplates.find(t => t.id === selectedTemplate);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Cover Letter Ideas | ATSBoost</title>
        <meta name="description" content="Craft the perfect South African cover letter with our professional templates, powerful openings, and achievement examples tailored for the local job market." />
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Cover Letter Ideas</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Create impactful cover letters that highlight your qualifications and stand out in the South African job market.
        </p>
      </div>
      
      <Tabs defaultValue="templates" value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px] mx-auto">
          <TabsTrigger value="templates" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="openings" className="flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            Openings
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
        </TabsList>
        
        {/* Templates Tab */}
        <TabsContent value="templates">
          {selectedTemplate ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle>{getTemplate()?.name} Template</CardTitle>
                      <CardDescription>{getTemplate()?.description}</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                      Back to Templates
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm overflow-auto max-h-[500px]">
                      {getTemplate()?.template}
                    </pre>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(getTemplate()?.template || "", "Template copied to clipboard")}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Template
                    </Button>
                    <Button 
                      onClick={() => {
                        const template = getTemplate();
                        const blob = new Blob([template?.template || ""], { type: 'text/plain' });
                        const href = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = href;
                        link.download = `${template?.name.replace(/\s+/g, '-').toLowerCase()}-cover-letter-template.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(href);
                      }}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Template Tips</CardTitle>
                    <CardDescription>Best practices for this template</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {getTemplate()?.tips.map((tip, index) => (
                      <div key={index} className="flex items-start">
                        <ArrowRight className="h-4 w-4 text-amber-500 mt-1 shrink-0 mr-2" />
                        <p className="text-sm">{tip}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Customization Options</CardTitle>
                    <CardDescription>Tailor your cover letter for South Africa</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="bbee-status">Include B-BBEE Status</Label>
                        <p className="text-xs text-muted-foreground">Mention your B-BBEE level if applicable</p>
                      </div>
                      <Switch 
                        checked={customizations.includeBBBEE}
                        onCheckedChange={(checked) => setCustomizations({...customizations, includeBBBEE: checked})}
                        id="bbee-status"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="nqf-level">Include NQF Level</Label>
                        <p className="text-xs text-muted-foreground">Specify NQF level of your qualifications</p>
                      </div>
                      <Switch 
                        checked={customizations.includeNQF}
                        onCheckedChange={(checked) => setCustomizations({...customizations, includeNQF: checked})}
                        id="nqf-level"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="formal-tone">Formal Business Tone</Label>
                        <p className="text-xs text-muted-foreground">Use more formal language in your letter</p>
                      </div>
                      <Switch 
                        checked={customizations.formalTone}
                        onCheckedChange={(checked) => setCustomizations({...customizations, formalTone: checked})}
                        id="formal-tone"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coverLetterTemplates.map((template) => (
                <Card key={template.id} className="hover:border-amber-300 transition-colors">
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                    <Badge variant="outline" className="w-fit">
                      {template.industry}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {template.template.substring(0, 150)}...
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {template.tips.slice(0, 3).map((tip, index) => (
                        <Badge key={index} variant="secondary" className="bg-amber-50 text-amber-800">
                          {tip.split(" ").slice(0, 3).join(" ")}...
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => setSelectedTemplate(template.id)}
                      className="w-full bg-amber-500 hover:bg-amber-600"
                    >
                      View Template <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Openings Tab */}
        <TabsContent value="openings">
          <Card>
            <CardHeader>
              <CardTitle>Powerful Opening Lines</CardTitle>
              <CardDescription>
                Start your cover letter with a strong opening that grabs attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {openingLines.map((line, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-muted rounded-md hover:bg-muted/80 transition-colors relative group"
                  >
                    <p className="pr-8">{line}</p>
                    <Button 
                      size="sm"
                      variant="ghost" 
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(line, "Opening line copied")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Alert className="bg-amber-50 border-amber-100">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <AlertTitle>Pro Tip</AlertTitle>
                <AlertDescription className="text-sm">
                  Replace the placeholders like [Position], [Company], and [industry/field] with specific information from the job you're applying to. Personalization is key to making your cover letter stand out.
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
          
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">South African Context Phrases</h3>
            <p className="text-muted-foreground mb-6">
              Include these South Africa-specific phrases to show your understanding of the local job market
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {saContextPhrases.map((phrase, index) => (
                <Card key={index} className="hover:border-amber-300 transition-colors relative group">
                  <CardContent className="pt-6">
                    <p className="text-sm">{phrase}</p>
                    <Button 
                      size="sm"
                      variant="ghost" 
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(phrase, "South African context phrase copied")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievement Statements</CardTitle>
                <CardDescription>
                  Use these industry-specific achievement examples to demonstrate your impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(achievementStatements).map(([industry, statements]) => (
                    <AccordionItem key={industry} value={industry}>
                      <AccordionTrigger className="capitalize">
                        {industry} Achievements
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          {statements.map((statement, index) => (
                            <div key={index} className="p-3 bg-muted rounded-md relative group hover:bg-muted/80 transition-colors">
                              <p className="text-sm pr-8">{statement}</p>
                              <Button 
                                size="sm"
                                variant="ghost" 
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(statement, "Achievement statement copied")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
              <CardFooter>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Customize Your Achievements</AlertTitle>
                  <AlertDescription className="text-sm">
                    Replace the example numbers and specifics with your actual accomplishments. Whenever possible, quantify your achievements with specific metrics and results.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter Best Practices</CardTitle>
                <CardDescription>Tips for creating effective cover letters in South Africa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Do's</h4>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                      <p className="text-sm">Include South African qualifications (NQF levels) and professional memberships</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                      <p className="text-sm">Mention relevant B-BBEE status and transformation alignment</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                      <p className="text-sm">Use formal business language with professional salutations</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                      <p className="text-sm">Include job reference numbers when provided</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 mr-2 shrink-0" />
                      <p className="text-sm">Demonstrate knowledge of local industry challenges and regulations</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Don'ts</h4>
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-1 mr-2 shrink-0" />
                      <p className="text-sm">Exceed one page in length</p>
                    </div>
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-1 mr-2 shrink-0" />
                      <p className="text-sm">Use overly casual language or slang</p>
                    </div>
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-1 mr-2 shrink-0" />
                      <p className="text-sm">Include salary expectations unless specifically requested</p>
                    </div>
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-1 mr-2 shrink-0" />
                      <p className="text-sm">Use generic templates without customization</p>
                    </div>
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-1 mr-2 shrink-0" />
                      <p className="text-sm">Include personal information not relevant to the job (age, marital status, etc.)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoverLetterIdeasPage;