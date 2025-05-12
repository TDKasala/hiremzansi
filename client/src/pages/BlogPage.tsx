import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Calendar, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

// Blog post type
type BlogPost = {
  id: number;
  title: string;
  slug: string;
  date: string;
  summary: string;
  category: string;
  image: string;
};

export default function BlogPage() {
  const { t } = useTranslation();
  // Blog posts
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "7 ATS-Friendly CV Tips for South African Job Seekers",
      slug: "7-ats-friendly-cv-tips-for-south-african-job-seekers",
      date: "May 10, 2023",
      summary: "Learn how to create an ATS-compliant CV that stands out in the South African job market with our expert tips covering B-BBEE, NQF levels, and local language proficiencies.",
      category: "CV Tips",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=400&h=250&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "What is an ATS and Why It Matters for SA Job Seekers",
      slug: "ats-explained",
      date: "June 15, 2023",
      summary: "Learn how Applicant Tracking Systems work and why optimizing your CV for them is crucial in the South African job market.",
      category: "ATS Basics",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: 3,
      title: "Top 10 Keywords for South African CVs in 2023",
      slug: "top-keywords",
      date: "June 8, 2023",
      summary: "Discover the most impactful keywords to include in your CV based on analysis of thousands of South African job listings.",
      category: "Keywords",
      image: "https://images.unsplash.com/photo-1517971129774-8a2b38fa128e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: 4,
      title: "How to Address Employment Gaps in Your CV",
      slug: "employment-gaps",
      date: "June 1, 2023",
      summary: "Practical advice for explaining gaps in your employment history in a way that won't trigger ATS red flags.",
      category: "CV Tips",
      image: "https://images.unsplash.com/photo-1560264280-88b68371db39?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: 5,
      title: "B-BBEE and Your CV: What You Need to Know",
      slug: "bbbee-and-cv",
      date: "May 25, 2023",
      summary: "Understanding how to properly include B-BBEE status in your CV to improve visibility with South African employers.",
      category: "South African Context",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: 6,
      title: "NQF Levels Explained: Showcasing Qualifications Correctly",
      slug: "nqf-levels-explained",
      date: "May 18, 2023",
      summary: "How to properly format your educational qualifications using the National Qualifications Framework levels for ATS recognition.",
      category: "South African Context",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
    },
    {
      id: 7,
      title: "The Impact of Formatting on ATS Scanning",
      slug: "formatting-impact",
      date: "May 11, 2023",
      summary: "Why the way your CV looks matters to ATS systems and how to format it for maximum compatibility.",
      category: "CV Tips",
      image: "https://images.unsplash.com/photo-1569144157591-c60f3f82f137?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
    }
  ];

  // Categories
  const categories = [...new Set(blogPosts.map(post => post.category))];

  return (
    <>
      <Helmet>
        <title>Blog | ATSBoost - CV Optimization Tips & Insights</title>
        <meta name="description" content="CV optimization tips, ATS insights, and job seeking advice for the South African market. Learn how to improve your CV and land more interviews." />
        <meta property="og:title" content="ATSBoost Blog - CV Optimization Tips" />
        <meta property="og:description" content="Practical advice for South African job seekers on optimizing CVs for ATS systems." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://atsboost.co.za/blog" />
      </Helmet>
      
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">ATS Insights Blog</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Expert advice on CV optimization and navigating the South African job market
          </p>
        </div>
      </div>
      
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="sticky top-24">
                <h2 className="text-xl font-bold mb-4">Categories</h2>
                <ul className="space-y-2">
                  <li>
                    <Link href="/blog">
                      <a className="text-primary font-medium">All Posts</a>
                    </Link>
                  </li>
                  {categories.map((category, index) => (
                    <li key={index}>
                      <Link href={`/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`}>
                        <a className="text-neutral-700 hover:text-primary">{category}</a>
                      </Link>
                    </li>
                  ))}
                </ul>
                
                <Separator className="my-6" />
                
                <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
                <ul className="space-y-4">
                  {blogPosts.slice(0, 3).map((post) => (
                    <li key={post.id}>
                      <Link href={`/blog/${post.slug}`}>
                        <a className="text-sm text-neutral-700 hover:text-primary font-medium">
                          {post.title}
                        </a>
                      </Link>
                      <div className="text-xs text-neutral-500 mt-1 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {post.date}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <div className="grid md:grid-cols-2 gap-8">
                {blogPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex items-center text-sm text-neutral-500 mb-2">
                        <span className="bg-neutral-100 px-2 py-1 rounded text-xs mr-2">
                          {post.category}
                        </span>
                        <Calendar className="h-4 w-4 mr-1" />
                        {post.date}
                      </div>
                      <h2 className="text-xl font-semibold mb-2">
                        <Link href={`/blog/${post.slug}`} className="text-secondary hover:text-primary">
                          {post.title}
                        </Link>
                      </h2>
                      <p className="text-neutral-600 mb-4 line-clamp-3">{post.summary}</p>
                      <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-primary font-medium hover:underline">
                        Read More <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
