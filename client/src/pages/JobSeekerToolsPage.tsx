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
  FileText, 
  LayoutGrid, 
  Book, 
  ListChecks, 
  FileQuestion,
  Gift
} from "lucide-react";

const JobSeekerToolsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <Helmet>
        <title>Job Seeker Tools | Hire Mzansi</title>
        <meta 
          name="description" 
          content="Access tools to boost your job search success in the South African market - CV templates, ATS keywords, cover letter templates, and more."
        />
      </Helmet>
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Job Seeker Tools</h1>
        <p className="text-muted-foreground mt-2">
          Tools to help you succeed in the South African job market
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {/* CV Templates */}
        <Card className="hover:border-primary/50 transition-colors group">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LayoutGrid className="h-5 w-5 mr-2 text-primary" />
              CV Templates
            </CardTitle>
            <CardDescription>
              South African focused resume templates
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Access professional CV templates optimized for the South African job market and ATS systems.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full group-hover:bg-primary/5">
              <Link href="/tools/cv-templates">Browse Templates</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* ATS Keywords Tool */}
        <Card className="hover:border-primary/50 transition-colors group">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              ATS Keywords Tool
            </CardTitle>
            <CardDescription>
              Industry-specific keywords for South Africa
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Generate tailored keywords for your industry that will help your CV pass ATS filters in South Africa.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full group-hover:bg-primary/5">
              <Link href="/tools/ats-keywords">Find Keywords</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Cover Letter Generator */}
        <Card className="hover:border-primary/50 transition-colors group">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Cover Letter Ideas
            </CardTitle>
            <CardDescription>
              South African cover letter guidance
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Get industry-specific cover letter templates and prompts tailored for South African employers.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full group-hover:bg-primary/5">
              <Link href="/tools/cover-letter-ideas">Create Cover Letter</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Premium Features */}
      <div className="border border-primary/30 rounded-lg p-6 bg-primary/5 mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <Gift className="h-6 w-6 text-primary mr-3" />
            <h2 className="font-semibold text-xl">Premium Tools</h2>
          </div>
          <Button size="sm" variant="default">Upgrade</Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-background p-5 rounded-lg border flex flex-col">
            <h3 className="font-medium text-lg flex items-center">
              <ListChecks className="h-5 w-5 text-primary mr-2" />
              CV Checklist
            </h3>
            <p className="text-sm text-muted-foreground my-3">
              Complete South African specific CV checklist with 50+ points to ensure your resume meets local standards and expectations.
            </p>
            <Button variant="outline" className="mt-auto" asChild>
              <Link href="/tools/cv-checklist">Access Tool</Link>
            </Button>
          </div>
          
          <div className="bg-background p-5 rounded-lg border flex flex-col">
            <h3 className="font-medium text-lg flex items-center">
              <FileText className="h-5 w-5 text-primary mr-2" />
              Cover Letter Ideas
            </h3>
            <p className="text-sm text-muted-foreground my-3">
              Templates and guidance for writing effective cover letters for the South African job market with industry-specific examples.
            </p>
            <Button variant="outline" className="mt-auto" asChild>
              <Link href="/tools/cover-letter-ideas">Cover Letter Tips</Link>
            </Button>
          </div>
          
          <div className="bg-background p-5 rounded-lg border flex flex-col">
            <h3 className="font-medium text-lg flex items-center">
              <Book className="h-5 w-5 text-primary mr-2" />
              Interview Guide
            </h3>
            <p className="text-sm text-muted-foreground my-3">
              South African interview preparation with common questions, industry-specific examples, and tips for answering in the local context.
            </p>
            <Button variant="outline" className="mt-auto" asChild>
              <Link href="/tools/interview-guide">Prepare for Interviews</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Resources */}
      <div className="bg-muted/50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">South African CV Guide</CardTitle>
              <CardDescription>Comprehensive guide on creating CVs for the local market</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Learn about B-BBEE information, NQF levels, and other South African specific elements to include in your CV.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/blog/south-african-cv-guide">Read Guide</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ATS Survival Guide</CardTitle>
              <CardDescription>Maximize your chances of getting past automated screening</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">With 90% of large companies using Applicant Tracking Systems, our 2025 guide helps you navigate these systems.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/blog/ats-survival-guide-2025">Read Guide</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerToolsPage;