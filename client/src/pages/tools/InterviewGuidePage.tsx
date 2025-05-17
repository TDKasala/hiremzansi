import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
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
  Briefcase, 
  Download, 
  Clock, 
  User, 
  Building, 
  Flag,
  CheckCircle2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Reference to public file
const INTERVIEW_GUIDE_PDF_URL = '/interview-guide.pdf';

const InterviewGuidePage: React.FC = () => {
  const downloadGuide = () => {
    window.open(INTERVIEW_GUIDE_PDF_URL, '_blank');
  };
  
  return (
    <div className="container mx-auto px-4 py-10">
      <Helmet>
        <title>Interview Guide | ATSBoost</title>
        <meta 
          name="description" 
          content="South African interview preparation guide with common questions, industry-specific examples, and local context answers."
        />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">South African Interview Guide</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive preparation resources for job interviews in the South African market
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="bg-muted/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Interview Preparation</CardTitle>
                <CardDescription>Download our comprehensive guide or explore by topic</CardDescription>
              </div>
              <Button onClick={downloadGuide} className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Download Full Guide
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              This guide covers key aspects of interviewing specifically for the South African job market, 
              including cultural context, common questions, and best practices.
            </p>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="preparation" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preparation">Preparation</TabsTrigger>
            <TabsTrigger value="common-questions">Common Questions</TabsTrigger>
            <TabsTrigger value="culture">SA Work Culture</TabsTrigger>
            <TabsTrigger value="follow-up">Follow-up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preparation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Briefcase className="mr-2 h-5 w-5 text-primary" />
                  Before the Interview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Research the Company and Industry</h3>
                    <ul className="space-y-2 text-sm pl-5 list-disc">
                      <li>Research the company's history, mission, values, products, and recent news</li>
                      <li>Understand the industry landscape in South Africa, including major competitors</li>
                      <li>Follow the company on LinkedIn and other social media platforms</li>
                      <li>Review the company's B-BBEE status and transformation policies</li>
                      <li>Research the company's approach to COVID-19 and remote work if applicable</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Prepare Your Documentation</h3>
                    <ul className="space-y-2 text-sm pl-5 list-disc">
                      <li>Bring multiple copies of your CV</li>
                      <li>Have your ID document or passport available</li>
                      <li>Bring copies of your qualifications and certificates</li>
                      <li>Prepare a list of references with their contact information</li>
                      <li>If relevant, have your portfolio or work samples ready</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Practice and Preparation</h3>
                    <ul className="space-y-2 text-sm pl-5 list-disc">
                      <li>Research the typical salary range for the position</li>
                      <li>Plan your route to the interview location or test your video call setup</li>
                      <li>Prepare questions to ask the interviewer</li>
                      <li>Practice your answers to common questions</li>
                      <li>Research the dress code (business formal is standard in South Africa unless specified otherwise)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="common-questions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  Common Interview Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="q1">
                    <AccordionTrigger>Tell me about yourself</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">How to answer:</p>
                        <p>Structure your answer as a concise professional summary. Start with your current role, mention your experience and key skills, and briefly explain why you're interested in this position.</p>
                        <p className="font-medium mt-3">Example:</p>
                        <p>"I'm a marketing professional with 5 years of experience in digital marketing for the retail sector in South Africa. I graduated with a BCom in Marketing from UCT and have since worked at [Company], where I've led campaigns that increased online sales by 30%. I'm particularly skilled in social media marketing and SEO strategies tailored for the South African market. I'm interested in this role because I'm passionate about [specific aspect of the role/company]."</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="q2">
                    <AccordionTrigger>Why do you want to work here?</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">How to answer:</p>
                        <p>Demonstrate that you've researched the company. Mention specific aspects of their culture, projects, or values that align with your career goals and personal values.</p>
                        <p className="font-medium mt-3">Example:</p>
                        <p>"I'm impressed by your company's focus on sustainable business practices and your leadership in the renewable energy sector in South Africa. Your recent project in the Eastern Cape aligns with my interest in expanding green energy in underserved communities. I also appreciate your company's commitment to skills development and B-BBEE initiatives, which shows a real investment in South Africa's future."</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="q3">
                    <AccordionTrigger>What are your strengths and weaknesses?</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">How to answer:</p>
                        <p>For strengths, mention skills relevant to the position with concrete examples. For weaknesses, choose something genuine but not critical to the role, and explain how you're working to improve it.</p>
                        <p className="font-medium mt-3">Example for strength:</p>
                        <p>"One of my key strengths is my ability to build relationships across diverse teams. In my previous role, I collaborated with colleagues from various cultural backgrounds and departments to deliver a successful product launch despite tight deadlines."</p>
                        <p className="font-medium mt-3">Example for weakness:</p>
                        <p>"I sometimes tend to focus too much on details, which can affect my time management. I've been working on this by using project management tools and setting clear priorities at the start of each day, which has significantly improved my efficiency."</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="q4">
                    <AccordionTrigger>How do you handle workplace conflicts?</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">How to answer:</p>
                        <p>Describe your approach to conflict resolution using the STAR method (Situation, Task, Action, Result). Emphasize communication, respect, and finding mutually beneficial solutions.</p>
                        <p className="font-medium mt-3">Example:</p>
                        <p>"In my previous role, I had different priorities from a colleague regarding a project timeline. I arranged a private meeting to understand their perspective, explained my concerns, and we collaboratively developed a compromise that addressed both our needs. We ended up completing the project ahead of schedule, and our working relationship actually improved after resolving this conflict."</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="q5">
                    <AccordionTrigger>What do you know about B-BBEE and Employment Equity?</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">How to answer:</p>
                        <p>Demonstrate your understanding of South Africa's transformation policies. Discuss how these initiatives contribute to addressing historical inequalities and creating a more inclusive workplace.</p>
                        <p className="font-medium mt-3">Example:</p>
                        <p>"B-BBEE (Broad-Based Black Economic Empowerment) is a government policy to increase participation of previously disadvantaged groups in the economy. Employment Equity aims to promote equal opportunity and fair treatment in the workplace by eliminating unfair discrimination. I understand these policies are essential for transformation in South Africa and creating diverse workplaces that reflect our nation's demographics. In my previous role, I participated in mentorship programs that supported these initiatives."</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="culture" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Building className="mr-2 h-5 w-5 text-primary" />
                  South African Work Culture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Professional Etiquette</h3>
                    <ul className="space-y-2 text-sm pl-5 list-disc">
                      <li>Punctuality is highly valued – arrive 10-15 minutes early</li>
                      <li>Greet everyone with a firm handshake and maintain eye contact</li>
                      <li>Use appropriate titles (Mr., Ms., Dr.) until invited to use first names</li>
                      <li>Business attire is generally formal in South African corporate settings</li>
                      <li>Be respectful of cultural diversity and different communication styles</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Diversity and Inclusion</h3>
                    <ul className="space-y-2 text-sm pl-5 list-disc">
                      <li>South Africa has 11 official languages – English is the primary business language</li>
                      <li>Demonstrate awareness of South Africa's diverse cultural landscape</li>
                      <li>Show understanding of transformation initiatives like B-BBEE</li>
                      <li>Respect for different religious and cultural practices in the workplace</li>
                      <li>Awareness of public holidays and their significance (e.g., Heritage Day, Freedom Day)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Workplace Dynamics</h3>
                    <ul className="space-y-2 text-sm pl-5 list-disc">
                      <li>Hierarchy is often respected in South African organizations</li>
                      <li>Team cohesion and collaboration are highly valued</li>
                      <li>Showing initiative while respecting established procedures</li>
                      <li>Work-life balance varies by company but is increasingly prioritized</li>
                      <li>Adaptability to load shedding (planned power outages) and other infrastructural challenges</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="follow-up" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="mr-2 h-5 w-5 text-primary" />
                  After the Interview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Follow-Up Protocol</h3>
                    <ul className="space-y-2 text-sm pl-5 list-disc">
                      <li>Send a thank-you email within 24 hours</li>
                      <li>Reference specific discussion points from the interview</li>
                      <li>Reaffirm your interest in the position</li>
                      <li>Include any additional information requested during the interview</li>
                      <li>Keep the email concise and professional</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Thank You Email Example</h3>
                    <div className="text-sm border p-3 rounded bg-white">
                      <p><strong>Subject:</strong> Thank You for the [Position] Interview</p>
                      <br />
                      <p>Dear [Interviewer's Name],</p>
                      <br />
                      <p>Thank you for taking the time to meet with me today to discuss the [Position] role at [Company Name]. I enjoyed learning more about your team's work on [specific project or aspect mentioned during the interview].</p>
                      <br />
                      <p>Our conversation reinforced my enthusiasm for the position and confidence that my skills in [mention relevant skills] would enable me to make valuable contributions to your team.</p>
                      <br />
                      <p>As mentioned during our discussion, I've attached [any additional information promised]. Please don't hesitate to contact me if you need any further information.</p>
                      <br />
                      <p>I look forward to hearing from you about the next steps in the process.</p>
                      <br />
                      <p>Kind regards,</p>
                      <p>[Your Name]</p>
                      <p>[Your Contact Information]</p>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Next Steps</h3>
                    <ul className="space-y-2 text-sm pl-5 list-disc">
                      <li>Follow up after one week if you haven't received a response</li>
                      <li>Continue applying for other positions while waiting</li>
                      <li>Prepare for potential subsequent interviews</li>
                      <li>If offered the position, request time to consider the offer</li>
                      <li>If not selected, ask for feedback to improve future interviews</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="bg-muted/30 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
            Expert Interview Tips
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-primary">South African Context</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Demonstrate understanding of local business challenges like load shedding</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Show awareness of B-BBEE and transformation goals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Be prepared to discuss your adaptability to a diverse workplace</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-primary">General Best Practices</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Research salary ranges before discussing compensation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Prepare examples using the STAR method (Situation, Task, Action, Result)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Address any gaps in your CV honestly but positively</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewGuidePage;