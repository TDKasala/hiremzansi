import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Share2, Bookmark, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  heroImage?: string;
};

// Sample blog post data for the ATS Survival Guide 2025
const atsGuide2025: BlogPost = {
  id: "1",
  title: "The Ultimate ATS Survival Guide for 2025",
  slug: "ATSSurvivalGuide2025",
  description: "Navigate the increasingly sophisticated ATS systems in 2025 with our comprehensive guide tailored for South African job seekers.",
  content: `
  <h2>Understanding the 2025 ATS Landscape</h2>
  <p>Applicant Tracking Systems (ATS) have evolved significantly in 2025, with over 95% of large South African companies now using AI-enhanced systems to screen CVs before they reach human recruiters. This comprehensive guide will help you navigate these sophisticated systems and ensure your CV makes it through the digital gatekeepers.</p>
  
  <h2>The Evolution of ATS in South Africa</h2>
  <p>South African businesses have rapidly adopted next-generation ATS technology, with many systems now incorporating advanced machine learning algorithms that go beyond simple keyword matching. These systems can now:</p>
  <ul>
    <li>Analyze your career progression and identify gaps</li>
    <li>Evaluate the relevance of your skills to the specific industry and role</li>
    <li>Assess your experience level against job requirements</li>
    <li>Identify South African-specific qualifications and their relevance</li>
    <li>Understand B-BBEE information and its significance</li>
  </ul>
  
  <h2>Essential CV Formatting for ATS Success</h2>
  <p>While ATS systems have become more sophisticated, proper formatting remains crucial:</p>
  <ul>
    <li><strong>Use standard section headings</strong>: "Work Experience," "Education," "Skills," etc.</li>
    <li><strong>Avoid complex layouts</strong>: Multiple columns, text boxes, and graphics can confuse ATS systems</li>
    <li><strong>Choose standard fonts</strong>: Arial, Calibri, Times New Roman at 10-12pt size</li>
    <li><strong>Use simple, clean formatting</strong>: Minimize tables, images, and special characters</li>
    <li><strong>Save in recommended formats</strong>: PDF or .docx are most compatible with modern ATS</li>
  </ul>
  
  <h2>Keyword Optimization Strategies for 2025</h2>
  <p>Modern ATS systems understand context better than ever, but strategic keyword placement remains important:</p>
  <ul>
    <li><strong>Analyze the job description</strong>: Identify both primary and secondary keywords</li>
    <li><strong>Match exact phrasings</strong>: Use the exact terminology from the job description</li>
    <li><strong>Focus on skills relevance</strong>: Prioritize skills that directly relate to the job</li>
    <li><strong>Include industry certifications</strong>: Mention relevant South African qualifications (SAQA, NQF levels)</li>
    <li><strong>Incorporate B-BBEE information</strong>: Where appropriate, include your B-BBEE status</li>
  </ul>
  
  <h2>South African Contextual Elements</h2>
  <p>For the South African job market, ensure you include these elements:</p>
  <ul>
    <li><strong>B-BBEE status</strong>: Clearly state your current status level</li>
    <li><strong>NQF qualifications</strong>: Include the NQF level of your qualifications</li>
    <li><strong>SETA certifications</strong>: Mention any relevant SETA-accredited courses</li>
    <li><strong>Local languages</strong>: List South African languages you speak and your proficiency level</li>
    <li><strong>Location specifics</strong>: If applying within South Africa, be specific about provinces/cities</li>
  </ul>
  
  <h2>Quantify Your Achievements</h2>
  <p>Modern ATS systems are increasingly able to recognize and prioritize achievements with measurable results:</p>
  <ul>
    <li>"Increased sales by 35% over 12 months"</li>
    <li>"Managed a team of 12 staff members across 3 departments"</li>
    <li>"Reduced operational costs by R250,000 annually"</li>
    <li>"Implemented new system that improved efficiency by 40%"</li>
    <li>"Completed 25 projects on time and within budget over 18 months"</li>
  </ul>
  
  <h2>2025 ATS Red Flags to Avoid</h2>
  <p>Modern ATS systems flag these issues more accurately than ever:</p>
  <ul>
    <li><strong>Unexplained employment gaps</strong>: Address gaps proactively</li>
    <li><strong>Overused buzzwords</strong>: "synergy," "proactive," "thought leader" without context</li>
    <li><strong>Inconsistent dates</strong>: Ensure your timeline is accurate and complete</li>
    <li><strong>Irrelevant information</strong>: Focus on relevant skills and experience only</li>
    <li><strong>Job hopping</strong>: Multiple very short tenures without explanation</li>
  </ul>
  
  <h2>Testing Your CV Against ATS</h2>
  <p>Before submitting your application, use Hire Mzansi's tools to:</p>
  <ul>
    <li>Score your CV against ATS algorithms</li>
    <li>Identify missing keywords and optimization opportunities</li>
    <li>Receive format compatibility recommendations</li>
    <li>Get South African context-specific suggestions</li>
    <li>Compare your CV against industry benchmarks</li>
  </ul>
  
  <h2>Conclusion: The Human Element</h2>
  <p>While optimizing for ATS is crucial, remember that your CV will eventually be read by a human. Strike a balance between ATS optimization and creating a compelling narrative that showcases your unique value proposition to potential employers.</p>
  
  <p>Hire Mzansi's comprehensive tools can help you navigate the complex world of ATS systems while maintaining the human touch that will ultimately help you stand out from the competition.</p>
  `,
  author: "Thabo Mokoena",
  date: "April 12, 2025",
  readTime: "8 min read",
  tags: ["ATS", "Job Search", "CV Optimization", "South Africa", "2025 Trends"],
  heroImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop"
};

export default function BlogDetailPage() {
  const [, setLocation] = useLocation();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Extract the slug from the URL path
  const path = window.location.pathname;
  const slug = path.split('/').pop();
  
  useEffect(() => {
    // In a real application, you would fetch the blog post data from an API
    // For now, we'll simulate an API call with a timeout
    setIsLoading(true);
    
    const loadBlogPost = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check if the slug matches our predefined blog post
        if (slug === "ATSSurvivalGuide2025") {
          setBlogPost(atsGuide2025);
        } else {
          // Blog post not found
          setBlogPost(null);
          setLocation("/blog");
          toast({
            title: "Blog post not found",
            description: "The requested article doesn't exist or has been moved.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading blog post:", error);
        toast({
          title: "Something went wrong",
          description: "Failed to load the blog post. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBlogPost();
  }, [slug, setLocation, toast]);
  
  const handleShare = () => {
    if (navigator.share && blogPost) {
      navigator.share({
        title: blogPost.title,
        text: blogPost.description,
        url: window.location.href,
      }).catch(error => console.log('Error sharing:', error));
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Blog post URL copied to clipboard.",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Helmet>
          <title>Loading Article... | Hire Mzansi Blog</title>
        </Helmet>
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/blog")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Button>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex items-center space-x-4 mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!blogPost) {
    return null; // Redirect will happen in useEffect
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{blogPost.title} | Hire Mzansi Blog</title>
        <meta name="description" content={blogPost.description} />
        <meta property="og:title" content={`${blogPost.title} | Hire Mzansi Blog`} />
        <meta property="og:description" content={blogPost.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://hiremzansi.co.za/blog/${blogPost.slug}`} />
        {blogPost.heroImage && <meta property="og:image" content={blogPost.heroImage} />}
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/blog")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
        </Button>
        
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {blogPost.heroImage && (
            <div className="w-full h-64 md:h-96 overflow-hidden">
              <img
                src={blogPost.heroImage}
                alt={blogPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              {blogPost.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-gray-600 mb-6 gap-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{blogPost.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{blogPost.date}</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-primary" />
                <span>{blogPost.readTime}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mb-6">
              {blogPost.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Last updated: {blogPost.date}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bookmark className="h-4 w-4 mr-2" /> Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>
        
        <Card className="mt-8 p-6 bg-amber-50 border-amber-200">
          <h2 className="text-xl font-bold mb-4">Ready to Apply What You've Learned?</h2>
          <p className="mb-4">
            Test your CV against the latest ATS algorithms and get personalized recommendations 
            to improve your chances of getting hired.
          </p>
          <Button onClick={() => setLocation("/upload")} className="bg-primary hover:bg-amber-600">
            Analyze Your CV Now
          </Button>
        </Card>
      </div>
    </div>
  );
}