import React from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { 
  CheckSquare, 
  FileType, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  Key, 
  PenTool,
  Award
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const JobSeekerToolsPage: React.FC = () => {
  const tools = [
    {
      title: "ATS Keywords Tool",
      description: "Find industry-specific keywords to boost your CV's ATS score for South African employers.",
      icon: Key,
      link: "/tools/ats-keywords",
      buttonText: "Explore Keywords"
    },
    {
      title: "Cover Letter Ideas",
      description: "Get templates and samples for effective cover letters tailored for South African job applications.",
      icon: PenTool,
      link: "/tools/cover-letter-ideas",
      buttonText: "View Templates"
    },
    {
      title: "CV Checklist",
      description: "Comprehensive checklist to ensure your CV meets both ATS and South African recruiter standards.",
      icon: CheckSquare,
      link: "/tools/cv-checklist",
      buttonText: "View Checklist"
    },
    {
      title: "CV Templates",
      description: "Access ATS-friendly CV templates optimized for South African employers and job applications.",
      icon: FileType,
      link: "/tools/cv-templates",
      buttonText: "Browse Templates"
    },
    {
      title: "Job Fit Quiz",
      description: "Take a quiz to determine which career paths best match your skills and experience.",
      icon: Briefcase,
      link: "/tools/job-fit-quiz",
      buttonText: "Start Quiz"
    },
    {
      title: "Interview Guide",
      description: "Prepare for interviews with sample questions and answers for common South African positions.",
      icon: MessageSquare,
      link: "/tools/interview-guide",
      buttonText: "Preparation Tips"
    },
    {
      title: "Interview Practice",
      description: "Interactive AI-powered interview simulator to practice your responses to common questions.",
      icon: Award,
      link: "/interview/practice",
      buttonText: "Practice Now",
      premium: true
    },
    {
      title: "Skills Gap Analyzer",
      description: "Identify gaps in your skill set and get personalized recommendations to boost employability.",
      icon: FileText,
      link: "/skills/analyze",
      buttonText: "Analyze Skills",
      premium: true
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Job Seeker Tools | ATSBoost</title>
        <meta 
          name="description" 
          content="Access a suite of specialized tools designed to help South African job seekers improve their CV, practice interviews, and boost employability."
        />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Job Seeker Tools</h1>
        <p className="text-gray-600">
          Comprehensive resources to help you stand out in the South African job market
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Card key={index} className={tool.premium ? 'border-amber-500 border-2' : ''}>
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <Icon className="h-8 w-8 text-amber-500 mb-2" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                    {tool.premium && (
                      <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded mt-1">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-600 min-h-[60px]">
                  {tool.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Link href={tool.link} className="w-full">
                  <Button 
                    variant={tool.premium ? "default" : "outline"} 
                    className="w-full"
                  >
                    {tool.buttonText}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default JobSeekerToolsPage;