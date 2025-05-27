import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Search, Tag, ArrowRight, Zap, Target, Brain, Star, ExternalLink } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  description: string;
  publishDate: string;
  readTime: string;
  category: string;
  tags: string[];
  featured: boolean;
  keywords: string[];
  summary: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'AI-Powered CV Optimization: Transform Your Job Search in South Africa',
    description: 'Discover how AI technology is revolutionizing CV optimization for South African job seekers with ATS-friendly formatting and local market insights.',
    publishDate: '2025-01-27',
    readTime: '8 min',
    category: 'CV Optimization',
    tags: ['AI', 'CV Optimization', 'ATS', 'South Africa', 'Job Search'],
    featured: true,
    keywords: ['AI CV optimization South Africa', 'ATS friendly CV', 'job search South Africa', 'CV formatting', 'applicant tracking system'],
    summary: `The South African job market is evolving rapidly, and traditional CV formats are no longer enough to stand out. With AI-powered CV optimization, job seekers can now create compelling resumes that pass Applicant Tracking Systems (ATS) and impress hiring managers.

Over 75% of South African companies use ATS software to filter applications. Without proper optimization, your CV might never reach human eyes. Our AI technology ensures your CV is ATS-compatible with proper formatting, keyword-optimized for your industry, and tailored to South African employment standards.

Our AI understands South African employment requirements including B-BBEE compliance and representation, NQF education level formatting, local industry terminology and standards, and regional salary expectations.

Our xAI-powered system analyzes your experience and identifies core competencies for your field, transferable skills you might have missed, industry-specific keywords to include, and skills gaps to address.

Ready to transform your job search? Visit https://atsboost.co.za and experience the power of AI-driven CV optimization designed specifically for the South African market.`
  },
  {
    id: '2',
    title: 'ATS-Friendly CV Format: Complete Guide for South African Job Seekers 2025',
    description: 'Master the art of ATS-friendly CV formatting with our comprehensive guide tailored for South African employment standards and local market requirements.',
    publishDate: '2025-01-26',
    readTime: '12 min',
    category: 'CV Tips',
    tags: ['ATS', 'CV Format', 'Job Applications', 'Career Advice', 'South Africa'],
    featured: true,
    keywords: ['ATS friendly CV format', 'South African CV format', 'applicant tracking system tips', 'CV formatting guide', 'job application tips South Africa'],
    summary: `Creating an ATS-friendly CV is crucial for job search success in South Africa. With most employers using Applicant Tracking Systems, your CV formatting can make or break your application.

An Applicant Tracking System (ATS) is software that scans and parses CV content, ranks applications based on keyword matches, filters candidates before human review, and manages the hiring pipeline efficiently.

Local companies increasingly adopt ATS technology with 80% of JSE-listed companies using ATS, government departments implementing digital screening, SMEs adopting cloud-based recruitment tools, and international companies requiring global standards.

Use standard fonts like Arial or Calibri, maintain 10-12pt font size, structure your header with name and job title, professional email address, South African phone number (+27), location (city, province), and LinkedIn profile URL.

Ready to optimize your CV for ATS success? Visit https://atsboost.co.za for professional analysis and AI-powered optimization tailored to the South African job market.`
  },
  {
    id: '3',
    title: 'Premium Job Matching Service: AI-Powered Recruitment for South African Market',
    description: 'Explore how AI-powered job matching is revolutionizing recruitment in South Africa, connecting qualified candidates with perfect opportunities through intelligent algorithms.',
    publishDate: '2025-01-25',
    readTime: '15 min',
    category: 'Job Matching',
    tags: ['AI', 'Job Matching', 'Recruitment', 'South Africa', 'Premium Service'],
    featured: true,
    keywords: ['AI job matching South Africa', 'premium recruitment service', 'intelligent hiring platform', 'job matching algorithm', 'South African recruitment technology'],
    summary: `The recruitment landscape in South Africa is being transformed by AI-powered job matching technology. Our premium service connects job seekers and recruiters through intelligent algorithms that understand local market dynamics and employment requirements.

Job seekers spend hours searching through irrelevant job postings, applying to positions that don't match their skills, missing opportunities due to poor job board algorithms, and lack feedback on application compatibility.

Our xAI-powered matching system analyzes multiple factors including Skills Compatibility (35% weight), Experience Level (15% weight), Salary Compatibility (15% weight), Location Preferences (12% weight), Industry Match (10% weight), South African Context (8% weight), and Availability (5% weight).

Our AI understands transformation requirements including B-BBEE scorecard optimization, employment equity compliance, skills development opportunities, and supplier development programs.

For Job Seekers (R50 Investment): Comprehensive profile analysis, intelligent job matching with compatibility scoring, career development insights, and direct recruiter connections.

Ready to experience intelligent job matching? Job Seekers start at https://atsboost.co.za/premium-job-seeker and Recruiters discover top talent at https://atsboost.co.za/premium-recruiter.`
  },
  {
    id: '4',
    title: 'South African Job Market Trends 2025: AI, Remote Work, and Skills Revolution',
    description: 'Analyze the latest trends shaping South Africa\'s job market in 2025, including AI adoption, remote work policies, and in-demand skills for career success.',
    publishDate: '2025-01-24',
    readTime: '18 min',
    category: 'Market Trends',
    tags: ['Job Market', 'AI', 'Remote Work', 'Skills', 'South Africa', 'Career Trends'],
    featured: false,
    keywords: ['South African job market 2025', 'remote work trends SA', 'AI in recruitment', 'skills gap South Africa', 'future of work trends'],
    summary: `The South African job market is experiencing unprecedented transformation in 2025. From AI adoption to remote work normalization, understanding these trends is crucial for career success and business growth.

Key statistics for 2025 show 58% of companies now use AI in recruitment processes, remote work adoption increased to 35% of all positions, skills gap affects 73% of South African employers, digital literacy becomes essential across all industries, and green jobs sector growing at 25% annually.

South African companies are rapidly adopting AI technology with large corporations (500+ employees) at 78%, medium businesses (50-500 employees) at 45%, small businesses (10-50 employees) at 23%, and startups and SMEs at 15%.

Remote work has fundamentally changed South African employment with technology at 85% offering remote options, financial services at 65% hybrid models, marketing/advertising at 70% remote-friendly, education at 55% online delivery, healthcare at 25% telemedicine roles, and manufacturing at 15% for office functions only.

South Africa faces a significant skills mismatch with most in-demand skills 2025 including Data Analysis and Analytics (90% demand increase), Artificial Intelligence and Machine Learning (85% growth), Cybersecurity (80% demand surge), Digital Marketing (75% market expansion), and Cloud Computing (70% adoption growth).

The future of work in South Africa is being written today. Position yourself at the forefront of these trends with AI-powered career tools at https://atsboost.co.za.`
  }
];

export default function SimpleBlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(blogPosts.map(post => post.category)))];
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              ATSBoost Blog
            </Link>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Back to App
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Career Insights & AI-Powered Job Search Tips
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover the latest trends, strategies, and technologies transforming the South African job market. 
            From AI-powered CV optimization to remote work best practices.
          </p>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured Articles */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map(post => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="gap-1">
                        <Target className="h-3 w-3" />
                        Featured
                      </Badge>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <CardTitle className="group-hover:text-blue-600 transition-colors leading-tight">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {post.publishDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/blog/${post.id}`}>
                      <Button className="w-full group-hover:bg-blue-600 transition-colors gap-2">
                        Read Article
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Regular Articles */}
        {regularPosts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-8">
              <Brain className="h-6 w-6 text-blue-500" />
              <h2 className="text-3xl font-bold text-gray-900">Latest Insights</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map(post => (
                <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <CardTitle className="group-hover:text-blue-600 transition-colors leading-tight">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {post.publishDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/blog/${post.id}`}>
                      <Button variant="outline" className="w-full group-hover:bg-blue-50 transition-colors gap-2">
                        Read More
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
            <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mt-16 text-center text-white">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8" />
            <h2 className="text-3xl font-bold">Ready to Transform Your Career?</h2>
          </div>
          <p className="text-xl mb-6 opacity-90">
            Get AI-powered CV optimization and intelligent job matching designed for the South African market.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://atsboost.co.za" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="gap-2">
                <Target className="h-5 w-5" />
                Optimize Your CV
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <a href="https://atsboost.co.za/premium-job-seeker" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 text-white border-white hover:bg-white hover:text-blue-600">
                <Brain className="h-5 w-5" />
                Premium Job Matching
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}