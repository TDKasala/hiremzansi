import React from "react";
import { ExternalLink, Star, ThumbsUp, CheckCircle, Badge, MapPin, Building, Users, Award } from "lucide-react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as BadgeUI } from "@/components/ui/badge";

export default function JobSitesPage() {
  // List of top South African job sites with descriptions
  const jobSites = [
    {
      name: "Career Junction",
      url: "https://www.careerjunction.co.za",
      description: "One of South Africa's leading online job boards with thousands of jobs across various industries. Features include job alerts, CV uploads, and employer profiles.",
      features: ["CV Builder", "Career Advice", "Salary Reports", "Job Alerts"],
      specialization: "All industries",
      rating: 4.5,
      location: "South Africa (National)",
      companyCount: "5,000+",
      verifiedEmployers: true,
      bestFor: "Comprehensive job search across all sectors"
    },
    {
      name: "PNet",
      url: "https://www.pnet.co.za",
      description: "A comprehensive platform with a wide range of job opportunities. PNet offers advanced search filters, personalized job recommendations, and company reviews.",
      features: ["Job Recommendations", "Application Tracking", "Company Reviews", "Resume Database"],
      specialization: "Corporate, Finance, IT",
      rating: 4.3,
      location: "South Africa (National)",
      companyCount: "4,500+",
      verifiedEmployers: true,
      bestFor: "Professional and executive positions"
    },
    {
      name: "Indeed South Africa",
      url: "https://za.indeed.com",
      description: "The world's largest job site, Indeed aggregates job listings from thousands of websites, including job boards, staffing firms, associations, and company career pages.",
      features: ["Salary Comparison", "Company Reviews", "Easy Application", "Job Alerts"],
      specialization: "All industries",
      rating: 4.7,
      location: "South Africa & Global",
      companyCount: "10,000+",
      verifiedEmployers: true,
      bestFor: "Wide range of jobs with easy application process"
    },
    {
      name: "LinkedIn Jobs",
      url: "https://www.linkedin.com/jobs",
      description: "Combines job listings with professional networking, allowing job seekers to connect with employers and see who they might know at companies of interest.",
      features: ["Network Insights", "Professional Profiles", "Direct Messaging", "Skill Assessments"],
      specialization: "Professional services, Tech, Finance",
      rating: 4.6,
      location: "South Africa & Global",
      companyCount: "15,000+",
      verifiedEmployers: true,
      bestFor: "Networking while job hunting"
    },
    {
      name: "Best Jobs South Africa",
      url: "https://www.bestjobs.co.za",
      description: "Specializes in highly-skilled professional positions with focus on the South African market. Features detailed job descriptions and direct application processes.",
      features: ["B-BBEE Focused", "NQF Level Filters", "Provincial Search", "Local Company Focus"],
      specialization: "Professional Services, Government",
      rating: 4.1,
      location: "South Africa (All Provinces)",
      companyCount: "2,000+",
      verifiedEmployers: true,
      bestFor: "South African specific employment requirements"
    },
    {
      name: "JobMail",
      url: "https://www.jobmail.co.za",
      description: "One of the oldest job boards in South Africa, offering a wide variety of positions across different sectors with a focus on blue-collar and entry-level jobs.",
      features: ["SMS Alerts", "Mobile-Friendly", "Walk-in Interview Listings", "Entry Level Focus"],
      specialization: "Entry-level, Trade, Service Industry",
      rating: 4.0,
      location: "South Africa (National)",
      companyCount: "3,500+",
      verifiedEmployers: false,
      bestFor: "Entry-level and blue-collar positions"
    },
    {
      name: "Careers24",
      url: "https://www.careers24.com",
      description: "A comprehensive job portal offering thousands of listings across various industries with career advice resources and CV tools.",
      features: ["Career Assessment Tools", "Industry Reports", "CV Health Check", "Interview Prep"],
      specialization: "All industries",
      rating: 4.2,
      location: "South Africa (All Provinces)",
      companyCount: "4,000+",
      verifiedEmployers: true,
      bestFor: "Career development tools and resources"
    },
    {
      name: "Bizcommunity Jobs",
      url: "https://www.bizcommunity.com/Jobs",
      description: "Specializes in marketing, advertising, media and creative industry jobs with industry news and insights alongside job listings.",
      features: ["Industry News", "Creative Portfolio Showcase", "Networking Events", "Freelance Opportunities"],
      specialization: "Marketing, Media, Creative, Communications",
      rating: 4.0,
      location: "South Africa (Major Cities)",
      companyCount: "1,500+",
      verifiedEmployers: false,
      bestFor: "Creative industry positions"
    },
    {
      name: "SA Learnerships",
      url: "https://www.salearnerships.com",
      description: "Focuses on learnerships, internships, and training opportunities for young South Africans entering the job market or looking to gain skills.",
      features: ["Learnership Listings", "Bursary Information", "Skills Development", "Youth Employment"],
      specialization: "Learnerships, Internships, Graduate Programs",
      rating: 4.4,
      location: "South Africa (National)",
      companyCount: "1,000+",
      verifiedEmployers: true,
      bestFor: "Youth entering the job market"
    },
    {
      name: "Jobs.co.za",
      url: "https://www.jobs.co.za",
      description: "A well-established South African job board with a strong focus on local positions and companies, featuring detailed company profiles and industry guides.",
      features: ["Company Profiles", "Industry Guides", "Local Business Focus", "Provincial Filters"],
      specialization: "All industries with South African focus",
      rating: 4.2,
      location: "South Africa (National)",
      companyCount: "3,000+",
      verifiedEmployers: true,
      bestFor: "Detailed information about local companies"
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Top 10 Job Listing Sites for South African Job Seekers | ATSBoost</title>
        <meta name="description" content="Discover the best job listing websites in South Africa to find your next career opportunity. Comprehensive guide with features and specializations." />
      </Helmet>
      
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Top Job Listing Sites in South Africa</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Find your next career opportunity through these leading South African job portals. 
          Each platform offers unique features to help you discover the perfect job match.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobSites.map((site, index) => (
          <Card key={index} className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{site.name}</CardTitle>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="ml-1 text-sm font-medium">{site.rating}</span>
                </div>
              </div>
              <CardDescription className="flex items-center text-sm">
                <MapPin className="h-3 w-3 mr-1" />
                {site.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 flex-grow">
              <p className="text-sm mb-4">{site.description}</p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Best for:</h4>
                <BadgeUI variant="secondary" className="bg-amber-100 text-amber-800">
                  {site.bestFor}
                </BadgeUI>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Key features:</h4>
                <div className="flex flex-wrap gap-1">
                  {site.features.map((feature, i) => (
                    <div key={i} className="flex items-center text-xs bg-primary/5 text-primary px-2 py-1 rounded-full">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center">
                  <Building className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span>Companies: {site.companyCount}</span>
                </div>
                <div className="flex items-center">
                  <Badge className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span>Specializes in: {site.specialization}</span>
                </div>
                <div className="flex items-center col-span-2">
                  {site.verifiedEmployers ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Verified employers</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span>Employer verification varies</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild className="w-full bg-amber-500 hover:bg-amber-600">
                <a href={site.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  Visit Site
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 bg-primary/5 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Tips for Using Job Listing Sites Effectively</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start">
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <Award className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Keep Your CV ATS-Optimized</h3>
              <p className="text-sm text-muted-foreground">
                Many of these sites use ATS systems to filter applications. Ensure your CV is optimized using ATSBoost's tools.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <Users className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Set Up Job Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Create job alerts with specific keywords relevant to your field to receive notifications about new opportunities.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <Badge className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Highlight South African Qualifications</h3>
              <p className="text-sm text-muted-foreground">
                Clearly mention NQF levels and B-BBEE status if applicable, as these are important in the South African job market.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <ThumbsUp className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Customize Each Application</h3>
              <p className="text-sm text-muted-foreground">
                Tailor your CV and cover letter for each job application rather than using the same generic application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}