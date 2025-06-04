import { Link } from "wouter";
import { Button } from "@/components/ui/button";

type BlogPost = {
  image: string;
  date: string;
  title: string;
  summary: string;
  slug: string;
};

export default function BlogPreviewSection() {
  const blogPosts: BlogPost[] = [
    {
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250",
      date: "May 15, 2025",
      title: "2025 ATS Algorithm Updates: What South African Job Seekers Must Know",
      summary: "Discover how the latest ATS algorithm changes affect your CV success rate and the essential strategies to maintain 90%+ pass rates in the competitive SA job market.",
      slug: "ats-survival-guide-2025"
    },
    {
      image: "https://images.unsplash.com/photo-1517971129774-8a2b38fa128e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250",
      date: "April 23, 2025",
      title: "B-BBEE and NQF Levels: Critical Elements for Your South African CV in 2025",
      summary: "Learn how properly documenting your B-BBEE status and NQF qualifications can increase interview callbacks by 35% according to Hire Mzansi.co.za's latest research.",
      slug: "b-bbee-impact-sa-resumes"
    },
    {
      image: "https://images.unsplash.com/photo-1560264280-88b68371db39?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250",
      date: "March 10, 2025",
      title: "Industry-Specific Resume Keywords That Boost ATS Scores by 40%",
      summary: "Hire Mzansi.co.za's comprehensive analysis of 50,000+ South African job postings reveals the exact keywords that will maximize your ATS ranking across 12 major industries.",
      slug: "industry-specific-cv-tips"
    }
  ];

  return (
    <section id="blog" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4">Latest ATS Insights</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Stay updated with our latest articles on CV optimization and the South African job market.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {blogPosts.map((post, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-48 object-cover" 
              />
              <div className="p-6">
                <div className="text-sm text-neutral-500 mb-2">{post.date}</div>
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-neutral-600 mb-4">{post.summary}</p>
                <Link href={`/blog/${post.slug}`} className="text-primary font-medium hover:underline">
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/blog">
            <Button variant="outline" className="bg-neutral-200 text-neutral-700 hover:bg-neutral-300">
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
