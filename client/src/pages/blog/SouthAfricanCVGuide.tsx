import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { CheckCircle, FileText, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import BlogAuthor from "../../components/BlogAuthor";
import { Button } from "@/components/ui/button";

export default function SouthAfricanCVGuide() {
  return (
    <>
      <Helmet>
        <title>Ultimate South African CV Guide | ATSBoost</title>
        <meta
          name="description"
          content="Comprehensive guide to creating a winning CV in South Africa, including ATS optimization, B-BBEE, NQF levels, and local job market requirements."
        />
      </Helmet>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">The Ultimate South African CV Guide</h1>
          <p className="text-muted-foreground mb-6">
            How to tailor your CV specifically for the South African job market
          </p>

          <BlogAuthor
            name="Thabo Mbeki"
            title="CV Specialist & Career Coach"
            date="May 15, 2025"
            readTime="12 min read"
          />

          <div className="mt-8 prose lg:prose-lg prose-headings:text-foreground prose-p:text-muted-foreground max-w-none">
            <div className="not-prose bg-muted p-4 rounded-lg mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-1">Get a free CV review</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Upload your CV to get a free ATS compatibility score and personalized recommendations
                  </p>
                  <Button asChild>
                    <a href="/upload">Check Your CV</a>
                  </Button>
                </div>
              </div>
            </div>

            <p className="lead">
              In South Africa's competitive job market with over 32% unemployment, your CV needs to stand out while also addressing unique local requirements. This guide covers everything you need to know to create a CV that gets noticed by both human recruiters and automated systems.
            </p>

            <h2 id="basics">The Basics of a South African CV</h2>
            <p>
              A South African CV (also called a resume in some contexts) follows similar principles to international CVs but includes some important local distinctions. Your CV should be:
            </p>

            <ul>
              <li>2-3 pages maximum (not the strict 1-page rule often applied in the US)</li>
              <li>Clear, concise, and error-free</li>
              <li>Tailored to each job application</li>
              <li>ATS-friendly with relevant keywords</li>
              <li>Complete with South Africa-specific information (more on this below)</li>
            </ul>

            <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 my-8">
              <h3 className="text-xl font-medium mb-4">South African CV Checklist</h3>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Contact Details</p>
                    <p className="text-sm text-muted-foreground">Include cell phone, email, and location (city).</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">ID Number/Citizenship</p>
                    <p className="text-sm text-muted-foreground">Partial ID or citizenship status (for work eligibility).</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">NQF Levels</p>
                    <p className="text-sm text-muted-foreground">Indicate NQF levels for all qualifications.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Languages</p>
                    <p className="text-sm text-muted-foreground">List languages spoken and proficiency levels.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">B-BBEE Status</p>
                    <p className="text-sm text-muted-foreground">Include if applicable (don't fabricate).</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Professional Bodies</p>
                    <p className="text-sm text-muted-foreground">Memberships to relevant SA organizations.</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 id="key-elements">Key Elements of a South African CV</h2>

            <Accordion type="multiple" className="w-full my-6">
              <AccordionItem value="personal-details">
                <AccordionTrigger>Personal Details</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">In South Africa, employers typically expect more personal information than in some other countries:</p>
                  <ul className="space-y-2 mb-3">
                    <li><strong>ID Number:</strong> Including at least part of your ID number is common (you can obscure the last few digits for privacy)</li>
                    <li><strong>Citizenship/Work Status:</strong> South African citizen, permanent resident, or work visa status</li>
                    <li><strong>Driver's License:</strong> Include if relevant to the position</li>
                    <li><strong>Languages:</strong> List languages with proficiency levels (essential in multilingual South Africa)</li>
                  </ul>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    <strong>Privacy Note:</strong> While including these details is customary, you can take reasonable precautions like partially masking your ID number for security.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="education">
                <AccordionTrigger>Education & NQF Levels</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">The South African National Qualifications Framework (NQF) is a system that categorizes qualifications by levels. Always include NQF levels with your qualifications:</p>
                  <ul className="space-y-2 mb-3">
                    <li><strong>NQF Level 4:</strong> Matric/National Senior Certificate</li>
                    <li><strong>NQF Level 5:</strong> Higher Certificate</li>
                    <li><strong>NQF Level 6:</strong> Diploma or Advanced Certificate</li>
                    <li><strong>NQF Level 7:</strong> Bachelor's Degree or Advanced Diploma</li>
                    <li><strong>NQF Level 8:</strong> Honours Degree or Postgraduate Diploma</li>
                    <li><strong>NQF Level 9:</strong> Master's Degree</li>
                    <li><strong>NQF Level 10:</strong> Doctoral Degree</li>
                  </ul>
                  <p>
                    Format example: <br />
                    <code className="bg-muted p-1 rounded text-sm">Bachelor of Commerce (Accounting) - NQF Level 7<br />University of Cape Town, 2017-2020</code>
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="bbbee">
                <AccordionTrigger>B-BBEE Status</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    Broad-Based Black Economic Empowerment (B-BBEE) is a government policy to increase participation of previously disadvantaged groups in the economy. Including your B-BBEE status can be beneficial if applicable:
                  </p>
                  <ul className="space-y-2 mb-3">
                    <li>Only include if you are eligible (Black, Coloured, Indian, or Chinese South African as per the B-BBEE Act)</li>
                    <li>You can simply state: "B-BBEE Status: [Your status]"</li>
                    <li>Don't fabricate this information as it can be verified</li>
                  </ul>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    <strong>Note:</strong> Not including B-BBEE status won't necessarily disadvantage candidates who don't qualify, but including it can be advantageous for those who do.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="work-experience">
                <AccordionTrigger>Work Experience Format</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    For work experience, South African employers value concrete achievements. Use this format:
                  </p>
                  <ul className="space-y-2 mb-3">
                    <li>Company name, location, and dates of employment</li>
                    <li>Your position title</li>
                    <li>3-5 bullet points of key responsibilities</li>
                    <li>2-3 bullet points of quantifiable achievements</li>
                  </ul>
                  <p>
                    Example achievement: <br />
                    <code className="bg-muted p-1 rounded text-sm">• Increased department productivity by 35% through implementation of new workflow system while reducing costs by R250,000 annually.</code>
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="professional-bodies">
                <AccordionTrigger>Professional Bodies & Associations</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3">
                    Membership in South African professional bodies can significantly strengthen your CV:
                  </p>
                  <ul className="space-y-2 mb-3">
                    <li><strong>SAICA:</strong> South African Institute of Chartered Accountants</li>
                    <li><strong>ECSA:</strong> Engineering Council of South Africa</li>
                    <li><strong>HPCSA:</strong> Health Professions Council of South Africa</li>
                    <li><strong>SACAP:</strong> South African Council for the Architectural Profession</li>
                    <li><strong>Law Society of South Africa</strong></li>
                  </ul>
                  <p>
                    Include your membership number and status (student member, associate, full member, etc.).
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <h2 id="ats-optimization">ATS Optimization for South African Jobs</h2>
            <p>
              Many South African companies now use Applicant Tracking Systems (ATS) to screen CVs before human review. To optimize your CV for ATS:
            </p>

            <ul>
              <li><strong>Use standard CV section headings</strong>: "Work Experience," "Education," "Skills" rather than creative alternatives</li>
              <li><strong>Include keywords from the job description</strong>: Incorporate key terms from the job posting</li>
              <li><strong>South African industry terms</strong>: Use local terminology (e.g., "matric" instead of "high school diploma")</li>
              <li><strong>Simple formatting</strong>: Avoid tables, text boxes, headers/footers, and images</li>
              <li><strong>File format</strong>: Submit as a PDF unless specifically requested otherwise</li>
            </ul>

            <div className="bg-muted p-6 rounded-lg my-8">
              <h3 className="text-lg font-medium mb-4">South African Industry-Specific Terms</h3>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <p className="font-medium">Finance & Accounting</p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    <li>CA(SA)</li>
                    <li>JSE Listings Requirements</li>
                    <li>King IV</li>
                    <li>SARS compliance</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Engineering</p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    <li>Pr.Eng</li>
                    <li>ECSA registered</li>
                    <li>SANS specifications</li>
                    <li>Mine Health and Safety Act</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <p className="font-medium">IT & Tech</p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    <li>MICT SETA</li>
                    <li>POPIA compliance</li>
                    <li>Fibre infrastructure</li>
                    <li>Africa-specific solutions</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <p className="font-medium">Legal</p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    <li>LLB (SA)</li>
                    <li>BBBEE legislation</li>
                    <li>South African case law</li>
                    <li>Constitutional Court experience</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 id="common-mistakes">Common South African CV Mistakes to Avoid</h2>
            <p>
              Steer clear of these common mistakes when crafting your South African CV:
            </p>

            <ul>
              <li><strong>Omitting key South African context</strong>: Failing to include NQF levels, language proficiencies, etc.</li>
              <li><strong>Ignoring ATS requirements</strong>: Using overly creative formats that can't be parsed by ATS</li>
              <li><strong>Generic applications</strong>: Not tailoring your CV to each specific job and company</li>
              <li><strong>International formatting</strong>: Following US/UK CV norms without adapting to South African expectations</li>
              <li><strong>Irrelevant information</strong>: Including details like age, marital status or religious affiliation (unless specifically relevant)</li>
              <li><strong>Outdated information</strong>: Keeping old, irrelevant experience from 10+ years ago</li>
            </ul>

            <Card className="my-8">
              <CardHeader>
                <CardTitle>Free CV Analysis</CardTitle>
                <CardDescription>
                  Get a personalized assessment of your CV's effectiveness for the South African job market
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Our AI-powered tool analyzes your CV against South African standards and provides recommendations for improvement, including ATS compatibility score and keyword suggestions.
                </p>
                <Button asChild>
                  <a href="/upload">
                    <FileText className="mr-2 h-4 w-4" />
                    Analyze My CV
                  </a>
                </Button>
              </CardContent>
            </Card>

            <h2 id="conclusion">Conclusion</h2>
            <p>
              Creating an effective South African CV requires attention to local requirements while maintaining global best practices. By including B-BBEE status (if applicable), NQF levels, relevant professional memberships, and optimizing for ATS systems, you can significantly increase your chances of success in South Africa's competitive job market.
            </p>
            <p>
              Remember to tailor each CV application to the specific job, emphasize relevant skills and achievements, and maintain a professional, error-free document.
            </p>

            <Separator className="my-8" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <a href="/tools/cv-templates">Browse CV Templates</a>
                </Button>
                <Button variant="outline" size="sm">
                  <a href="/tools/cover-letter">Create Cover Letter</a>
                </Button>
              </div>
              <Button asChild className="w-full sm:w-auto">
                <a href="/upload">
                  <Download className="mr-2 h-4 w-4" />
                  Check Your CV Score
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}