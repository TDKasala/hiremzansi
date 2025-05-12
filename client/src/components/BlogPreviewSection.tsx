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
      date: "June 15, 2023",
      title: "What is an ATS and Why It Matters for SA Job Seekers",
      summary: "Learn how Applicant Tracking Systems work and why optimizing your CV for them is crucial in the South African job market.",
      slug: "ats-explained"
    },
    {
      image: "https://images.unsplash.com/photo-1517971129774-8a2b38fa128e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250",
      date: "June 8, 2023",
      title: "Top 10 Keywords for South African CVs in 2023",
      summary: "Discover the most impactful keywords to include in your CV based on analysis of thousands of South African job listings.",
      slug: "top-keywords"
    },
    {
      image: "https://images.unsplash.com/photo-1560264280-88b68371db39?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250",
      date: "June 1, 2023",
      title: "How to Address Employment Gaps in Your CV",
      summary: "Practical advice for explaining gaps in your employment history in a way that won't trigger ATS red flags.",
      slug: "employment-gaps"
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
