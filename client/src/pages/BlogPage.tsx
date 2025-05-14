import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "b-bbee-impact-sa-resumes",
    title: "How B-BBEE Status Impacts Your South African Resume",
    excerpt: "B-BBEE status has become an important factor in the South African job market. Learn how to properly highlight your B-BBEE information on your CV.",
    date: "May 12, 2025",
    author: "Thabo Mabena",
    image: "https://placehold.co/600x400/28a745/FFFFFF/png?text=B-BBEE+Impact",
    category: "South African Job Market"
  },
  {
    id: 2,
    slug: "nqf-levels-explained",
    title: "NQF Levels Explained: What South African Employers Look For",
    excerpt: "Understanding the National Qualifications Framework (NQF) is essential when applying for jobs in South Africa. Learn how to correctly present your qualifications.",
    date: "May 8, 2025",
    author: "Sarah Johnson",
    image: "https://placehold.co/600x400/28a745/FFFFFF/png?text=NQF+Levels",
    category: "Education & Qualifications"
  },
  {
    id: 3,
    slug: "ats-survival-guide-2025",
    title: "2025 ATS Survival Guide for South African Job Seekers",
    excerpt: "With 90% of large companies using Applicant Tracking Systems, understanding how to optimize your resume for ATS is more crucial than ever.",
    date: "April 30, 2025",
    author: "Lerato Moloi",
    image: "https://placehold.co/600x400/28a745/FFFFFF/png?text=ATS+Guide",
    category: "Resume Optimization"
  },
  {
    id: 4,
    slug: "remote-work-opportunities-sa",
    title: "Finding Remote Work Opportunities in South Africa",
    excerpt: "Remote work has transformed the job landscape in South Africa. Discover how to position your CV for remote positions.",
    date: "April 25, 2025",
    author: "William Pretorius",
    image: "https://placehold.co/600x400/28a745/FFFFFF/png?text=Remote+Work",
    category: "Job Search Strategy"
  },
  {
    id: 5,
    slug: "industry-specific-cv-tips",
    title: "Industry-Specific CV Tips for South Africa's Growth Sectors",
    excerpt: "Different industries require different CV approaches. Learn how to tailor your resume for South Africa's growing industries like tech, renewable energy, and healthcare.",
    date: "April 18, 2025",
    author: "Nomsa Dlamini",
    image: "https://placehold.co/600x400/28a745/FFFFFF/png?text=Industry+Tips",
    category: "Industry Insights"
  },
  {
    id: 6,
    slug: "language-proficiency-cv",
    title: "The Importance of Language Proficiency on Your South African CV",
    excerpt: "In a country with 11 official languages, how you present your language skills can significantly impact your job prospects.",
    date: "April 10, 2025",
    author: "Daniel van der Merwe",
    image: "https://placehold.co/600x400/28a745/FFFFFF/png?text=Language+Skills",
    category: "Resume Essentials"
  },
  {
    id: 7,
    slug: "linkedin-optimization-sa-professionals",
    title: "LinkedIn Optimization Tips for South African Professionals",
    excerpt: "Your LinkedIn profile works alongside your CV. Learn how to optimize both for maximum impact in the South African job market.",
    date: "April 3, 2025",
    author: "Priya Naidoo",
    image: "https://placehold.co/600x400/28a745/FFFFFF/png?text=LinkedIn+Tips",
    category: "Social Media Presence"
  },
  {
    id: 8,
    slug: "graduate-cv-templates",
    title: "CV Templates for South African Graduates With No Experience",
    excerpt: "New to the job market? Learn how to create an impressive CV even with limited work experience in the competitive South African job market.",
    date: "March 28, 2025",
    author: "Blessing Mokoena",
    image: "https://placehold.co/600x400/28a745/FFFFFF/png?text=Graduate+CV",
    category: "Entry-Level Strategies"
  },
  {
    id: 9,
    slug: "personal-branding-job-search",
    title: "Personal Branding: The Secret Weapon in Your Job Search",
    excerpt: "Discover how to develop a personal brand that makes your CV stand out to South African employers and ATS systems.",
    date: "March 20, 2025",
    author: "Jessica Adams",
    image: "https://placehold.co/600x400/28a745/FFFFFF/png?text=Personal+Branding",
    category: "Career Development"
  },
  {
    id: 10,
    slug: "ai-tools-resume-optimization",
    title: "AI Tools That Can Transform Your South African Resume",
    excerpt: "Artificial intelligence is changing how resumes are created and optimized. Explore the best AI tools for South African job seekers.",
    date: "March 15, 2025",
    author: "Mandla Nkosi",
    image: "https://placehold.co/600x400/28a745/FFFFFF/png?text=AI+Tools",
    category: "Technology & Innovation"
  }
];

const BlogPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>Career Insights Blog | ATSBoost South Africa</title>
        <meta 
          name="description" 
          content="Expert advice on CV optimization, ATS strategies, and job search tips for the South African market from ATSBoost.co.za" 
        />
      </Helmet>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">ATSBoost Career Insights</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Expert advice on resume optimization, ATS strategies, and job search tips tailored for the South African job market
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:shadow-xl">
            <Link href={`/blog/${post.slug}`}>
              <a className="block">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-48 object-cover"
                />
                
                <div className="p-6">
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                    {post.category}
                  </span>
                  
                  <h2 className="text-xl font-bold mt-2 mb-3 hover:text-green-600 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {post.date} • {post.author}
                    </span>
                    
                    <span className="text-green-600 font-semibold text-sm hover:underline">
                      Read More →
                    </span>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-16">
        <Link href="/contact">
          <a className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors">
            Request CV Review
          </a>
        </Link>
        
        <p className="mt-4 text-sm text-gray-500">
          Get personalized CV optimization advice from our team of experts at <a href="https://atsboost.co.za" className="text-green-600 hover:underline" target="_blank" rel="noopener noreferrer">ATSBoost.co.za</a>
        </p>
      </div>
    </div>
  );
};

export default BlogPage;