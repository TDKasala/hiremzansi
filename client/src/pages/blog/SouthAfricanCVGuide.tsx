import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  File, 
  FileCheck, 
  ListChecks, 
  CheckCircle, 
  Flag,
  GraduationCap,
  Briefcase,
  Globe,
  Users
} from "lucide-react";
import BlogAuthor from "@/components/BlogAuthor";

export default function SouthAfricanCVGuide() {
  return (
    <>
      <Helmet>
        <title>South African CV Guide 2025 | ATSBoost</title>
        <meta 
          name="description" 
          content="Complete guide to creating a winning CV in South Africa for 2025. Learn about B-BBEE, NQF levels, ATS optimization, and regional considerations." 
        />
        <meta property="og:title" content="The Ultimate Guide to South African CVs in 2025" />
        <meta property="og:description" content="Learn how to create a powerful CV that stands out in the South African job market with our comprehensive guide." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://atsboost.co.za/blog/south-african-cv-guide" />
      </Helmet>
      
      <div className="container max-w-4xl py-8 px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            The Ultimate South African CV Guide for 2025
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6">
            A comprehensive guide to creating a winning CV tailored for the South African job market
          </p>
          
          <BlogAuthor 
            name="Thabo Molefe"
            title="Career Specialist"
            date="May 10, 2025"
            readTime="12 min read"
          />
        </div>
        
        <div className="prose prose-green max-w-none">
          <div className="flex items-center p-4 mb-8 bg-primary/5 rounded-lg border border-primary/20">
            <div className="mr-4 p-2 bg-primary/10 rounded-full">
              <FileCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">2025 Update</h2>
              <p className="text-sm">This guide incorporates the latest ATS technologies and hiring practices in South Africa for 2025, including updated B-BBEE codes and NQF qualification frameworks.</p>
            </div>
          </div>
          
          <h2 className="mt-8 mb-4 text-2xl font-bold">
            Why South African CVs Need Special Attention
          </h2>
          
          <p>
            Creating a CV for the South African job market requires specific considerations that differ from international standards. South Africa's unique employment landscape, influenced by B-BBEE legislation, NQF qualification framework, and regional economic differences, demands a tailored approach to CV writing.
          </p>
          
          <Alert className="my-6">
            <File className="h-4 w-4" />
            <AlertTitle>Key Fact</AlertTitle>
            <AlertDescription>
              According to recent studies, 76% of South African HR professionals spend less than 10 seconds scanning a CV before deciding whether to review it further. Making your CV ATS-compliant and locally relevant is crucial.
            </AlertDescription>
          </Alert>
          
          <h2 className="mt-8 mb-4 text-2xl font-bold">
            Essential Elements for South African CVs
          </h2>
          
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-primary/10 p-2 rounded-full mt-1">
                  <Flag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">B-BBEE Status</h3>
                  <p>Including your B-BBEE status is essential for many South African employers who need to meet employment equity requirements under the Employment Equity Act. Clearly state your B-BBEE level if applicable.</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-primary/10 p-2 rounded-full mt-1">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">NQF Levels</h3>
                  <p>Always specify the National Qualifications Framework (NQF) level for your qualifications. For example, indicate "Bachelor's Degree (NQF Level 7)" rather than just "Bachelor's Degree" to help employers understand your qualification level within the South African context.</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-primary/10 p-2 rounded-full mt-1">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Industry-Specific Keywords</h3>
                  <p>Include South African industry-specific terminology and keywords relevant to your field. This is particularly important for sectors like mining, agriculture, financial services, and public sector positions.</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full mt-1">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Language Skills</h3>
                  <p>In the multilingual South African context, detailing your proficiency in official languages can be a significant advantage. Clearly state your proficiency levels in languages like Zulu, Xhosa, Afrikaans, etc.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <h2 className="mt-8 mb-4 text-2xl font-bold">
            Regional Considerations
          </h2>
          
          <p>
            Job markets vary considerably across South African provinces. Tailoring your CV to regional priorities can significantly increase your chances of success:
          </p>
          
          <ul className="space-y-2 my-4 pl-6">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span><strong>Gauteng:</strong> Emphasize corporate experience and metropolitan skills for this business hub</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span><strong>Western Cape:</strong> Highlight tech skills and international experience</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span><strong>KwaZulu-Natal:</strong> Focus on logistics, manufacturing, and tourism expertise</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span><strong>Eastern Cape:</strong> Emphasize automotive industry experience where relevant</span>
            </li>
          </ul>
          
          <h2 className="mt-8 mb-4 text-2xl font-bold">
            ATS Optimization for South African Employers
          </h2>
          
          <p>
            Many South African companies now use Applicant Tracking Systems (ATS) to filter CVs. Here's how to ensure yours passes these digital gatekeepers:
          </p>
          
          <div className="bg-gray-50 p-5 rounded-lg border my-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <ListChecks className="h-5 w-5 text-primary mr-2" />
              South African ATS Checklist
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Use standard CV sections</p>
                  <p className="text-sm text-muted-foreground">Personal details, work experience, education, skills</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Include South African-specific information</p>
                  <p className="text-sm text-muted-foreground">ID number, B-BBEE status, NQF qualification levels</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Match keywords from job descriptions</p>
                  <p className="text-sm text-muted-foreground">Pay special attention to South African industry terminology</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/10 rounded-full p-1 mr-3 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Keep formatting simple</p>
                  <p className="text-sm text-muted-foreground">Avoid tables, graphics, and complex layouts that South African ATS might not process correctly</p>
                </div>
              </li>
            </ul>
          </div>
          
          <h2 className="mt-8 mb-4 text-2xl font-bold">
            Cultural Considerations in South African CVs
          </h2>
          
          <p>
            The South African workplace values diversity, community engagement, and social responsibility:
          </p>
          
          <div className="flex items-start gap-3 my-6">
            <div className="bg-primary/10 p-2 rounded-full mt-1">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Community Involvement</h3>
              <p>Include community service, volunteer work, and social responsibility initiatives. South African employers often value candidates who contribute to societal development. This is particularly important for roles in public service, education, and healthcare.</p>
            </div>
          </div>
          
          <h2 className="mt-8 mb-4 text-2xl font-bold">
            Conclusion
          </h2>
          
          <p>
            Creating an effective South African CV requires attention to local requirements, regional preferences, and cultural nuances. By incorporating B-BBEE information, NQF qualification levels, and optimizing for local ATS systems, you'll significantly improve your chances of landing interviews with South African employers.
          </p>
          
          <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 mt-8">
            <h3 className="text-lg font-semibold mb-2">Get Your CV ATS Score</h3>
            <p className="mb-4">
              Use our free tool to check how well your CV performs against South African ATS systems. Receive instant feedback and optimization suggestions.
            </p>
            <a 
              href="/upload" 
              className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              <FileCheck className="mr-2 h-4 w-4" />
              Check Your CV Now
            </a>
          </div>
        </div>
      </div>
    </>
  );
}