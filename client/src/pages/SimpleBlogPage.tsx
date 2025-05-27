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
    summary: `By the ATSBoost Team - Your trusted partners in career advancement

The South African job market is evolving rapidly, and traditional CV formats are no longer enough to stand out. With AI-powered CV optimization, job seekers can now create compelling resumes that pass Applicant Tracking Systems (ATS) and impress hiring managers.

At ATSBoost.co.za, we've helped thousands of South African professionals transform their careers through intelligent CV optimization. Over 75% of South African companies use ATS software to filter applications. Without proper optimization, your CV might never reach human eyes.

Our AI technology ensures your CV is ATS-compatible with proper formatting, keyword-optimized for your industry, and tailored to South African employment standards including B-BBEE compliance, NQF education level formatting, and regional salary expectations.

Our xAI-powered system analyzes your experience and identifies core competencies, transferable skills, industry-specific keywords, and skills gaps to address.

Real Success Stories: Sarah from Cape Town improved her ATS score from 45% to 92%, leading to 3x more interview invitations. David's optimized CV highlighted his B-BBEE credentials effectively, resulting in placement at a top JSE-listed company.

Visit https://atsboost.co.za and experience the power of AI-driven CV optimization designed specifically for the South African market.`
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
    summary: `By the ATSBoost Team - Your career development specialists

The South African job market is experiencing unprecedented transformation in 2025. From AI adoption to remote work normalization, understanding these trends is crucial for career success and business growth.

Key statistics for 2025 show 58% of companies now use AI in recruitment processes, remote work adoption increased to 35% of all positions, skills gap affects 73% of South African employers, digital literacy becomes essential across all industries, and green jobs sector growing at 25% annually.

At https://atsboost.co.za, we help professionals navigate these changes through AI-powered career optimization.

The future of work in South Africa is being written today. Position yourself at the forefront of these trends with AI-powered career tools at https://atsboost.co.za.`
  },
  {
    id: '5',
    title: 'What is an ATS? Complete Guide to Applicant Tracking Systems in South Africa',
    description: 'Understanding Applicant Tracking Systems and how they impact your job search in South Africa. Learn to navigate ATS successfully with expert insights.',
    publishDate: '2025-01-23',
    readTime: '10 min',
    category: 'ATS Guide',
    tags: ['ATS', 'Applicant Tracking System', 'Job Search', 'South Africa', 'HR Technology'],
    featured: true,
    keywords: ['what is ATS', 'applicant tracking system South Africa', 'ATS meaning', 'how ATS works', 'beat ATS system'],
    summary: `By the ATSBoost Team - Your experts in ATS optimization

If you've been wondering "What is an ATS?" and how it affects your job search in South Africa, you're not alone. Applicant Tracking Systems have quietly revolutionized hiring across the country.

An ATS is software that automates hiring by collecting, sorting, scanning, and ranking job applications. Think of it as a digital gatekeeper that determines whether your CV reaches human recruiters.

85% of JSE-listed companies use ATS, 95% of multinationals have adopted it, and 60% of government departments are implementing digital screening. Only 25% of applications typically pass initial ATS screening.

At https://atsboost.co.za, we've helped thousands navigate ATS successfully. Get your free ATS compatibility analysis today.`
  },
  {
    id: '6',
    title: 'Remote Work Opportunities in South Africa: Complete Guide for 2025',
    description: 'Discover the best remote work opportunities for South African professionals, including global companies hiring locally and skills in demand.',
    publishDate: '2025-01-22',
    readTime: '14 min',
    category: 'Remote Work',
    tags: ['Remote Work', 'South Africa', 'Global Jobs', 'Digital Nomad', 'Work From Home'],
    featured: true,
    keywords: ['remote work South Africa', 'work from home jobs SA', 'global remote opportunities', 'digital nomad South Africa', 'remote work trends'],
    summary: `By the ATSBoost Team - Connecting SA talent with global opportunities

Remote work has transformed career possibilities for South African professionals. Technology sectors offer 85% remote options, financial services 65% hybrid models, and marketing 70% remote-friendly positions.

Top global companies hiring South Africans remotely include Shopify, GitLab, Buffer, Automattic, and InVision. Essential skills include cloud collaboration, digital project management, and cross-cultural communication.

Rural opportunities are expanding with improved internet infrastructure enabling remote employment and cost of living arbitrage for remote workers.

Optimize your remote work applications with CV formatting designed for global ATS systems at https://atsboost.co.za.`
  },
  {
    id: '7',
    title: 'B-BBEE Impact on SA Resumes: How to Highlight Transformation Experience',
    description: 'Learn how to effectively showcase B-BBEE credentials and transformation experience on your CV to stand out in the South African job market.',
    publishDate: '2025-01-21',
    readTime: '11 min',
    category: 'B-BBEE',
    tags: ['B-BBEE', 'Transformation', 'South Africa', 'Diversity', 'Employment Equity'],
    featured: false,
    keywords: ['B-BBEE CV tips', 'transformation experience resume', 'employment equity SA', 'diversity hiring South Africa', 'B-BBEE credentials'],
    summary: `By the ATSBoost Team - Transformation and career development experts

B-BBEE and transformation initiatives significantly impact hiring decisions across South African companies. Understanding how to effectively present your transformation credentials can dramatically improve your job prospects.

Key areas to highlight include B-BBEE status (if advantageous), diversity and inclusion leadership, skills development mentoring, community investment activities, and supplier development experience.

Companies increasingly value candidates who can contribute to transformation objectives while bringing professional expertise. This dual value proposition makes you highly attractive to employers.

Strategic positioning of B-BBEE credentials should be natural and achievement-focused rather than tokenistic. Focus on measurable impact and leadership in transformation initiatives.

Get professional guidance on optimizing your transformation credentials at https://atsboost.co.za.`
  },
  {
    id: '8',
    title: 'NQF Levels Explained: SA Education Qualifications for Your CV',
    description: 'Complete guide to South African NQF levels and how to properly format education qualifications on your CV for local and international employers.',
    publishDate: '2025-01-20',
    readTime: '9 min',
    category: 'Education',
    tags: ['NQF', 'Education', 'Qualifications', 'South Africa', 'CV Tips'],
    featured: false,
    keywords: ['NQF levels South Africa', 'SA education qualifications', 'CV education section', 'SAQA recognition', 'qualification levels SA'],
    summary: `By the ATSBoost Team - Education and qualification specialists

Understanding and properly presenting NQF levels on your CV is crucial for South African job seekers. The National Qualifications Framework provides a standardized way to compare qualifications across different education providers.

NQF levels range from 1 (Grade 9) to 10 (Doctoral degree), with specific levels for different qualification types. Proper formatting includes NQF level, qualification name, institution, and completion dates.

International qualifications should include SAQA recognition status when applicable. Professional registrations with bodies like ECSA, SACAP, or HPCSA should be prominently displayed with registration numbers.

Many employers search specifically for NQF levels in ATS systems, making proper formatting essential for CV visibility.

Ensure your education section is optimized for South African employers at https://atsboost.co.za.`
  },
  {
    id: '9',
    title: 'Salary Negotiation Strategies for South African Professionals 2025',
    description: 'Master salary negotiation in the South African job market with data-driven strategies, market insights, and expert tips for maximizing your compensation.',
    publishDate: '2025-01-19',
    readTime: '16 min',
    category: 'Salary',
    tags: ['Salary Negotiation', 'Compensation', 'South Africa', 'Career Advancement', 'Market Rates'],
    featured: true,
    keywords: ['salary negotiation South Africa', 'SA salary trends 2025', 'compensation negotiation tips', 'market rates South Africa', 'salary increase strategies'],
    summary: `By the ATSBoost Team - Compensation and career advancement specialists

Salary negotiation in South Africa requires understanding market dynamics, cost of living variations, and industry-specific compensation trends. Successful negotiation can result in 15-25% salary improvements.

Key strategies include researching market rates using platforms like PayScale SA and Glassdoor, understanding total compensation packages including benefits, and timing negotiations strategically during performance reviews or job offers.

Industry variations are significant: Technology professionals can expect 10-20% annual increases, while traditional sectors like manufacturing typically see 5-8% growth. Location matters too, with Cape Town and Johannesburg commanding premium salaries.

Preparation is crucial - document achievements with quantifiable results, understand company financial health, and practice negotiation scenarios.

Access salary benchmarking data and negotiation coaching at https://atsboost.co.za.`
  },
  {
    id: '10',
    title: 'Industry-Specific CV Tips for South African Job Sectors',
    description: 'Specialized CV guidance for key South African industries including mining, finance, healthcare, technology, and government positions.',
    publishDate: '2025-01-18',
    readTime: '13 min',
    category: 'Industry Tips',
    tags: ['Industry CV', 'Sector Specific', 'South Africa', 'Professional Tips', 'Career Advice'],
    featured: false,
    keywords: ['industry specific CV South Africa', 'mining CV tips', 'finance CV guide', 'healthcare resume SA', 'government job applications'],
    summary: `By the ATSBoost Team - Industry specialization experts

Different South African industries have unique CV requirements and expectations. Understanding sector-specific needs dramatically improves your application success rate.

Mining sector emphasizes safety certifications (MHSA compliance), environmental awareness, and multilingual capabilities. Finance requires regulatory knowledge (FICA, POPIA), risk management experience, and technical certifications.

Healthcare demands professional registrations (HPCSA numbers), CPD compliance, and patient care experience. Technology values programming languages, cloud certifications, and agile methodologies.

Government positions focus on policy experience, public sector knowledge, and transformation contributions. Each sector uses specific ATS keywords and evaluation criteria.

Get industry-specific CV optimization at https://atsboost.co.za with our specialized sector expertise.`
  },
  {
    id: '11',
    title: 'LinkedIn Optimization for South African Professionals: Complete Guide',
    description: 'Transform your LinkedIn profile to attract recruiters and opportunities in the South African market with expert optimization strategies.',
    publishDate: '2025-01-17',
    readTime: '12 min',
    category: 'LinkedIn',
    tags: ['LinkedIn', 'Professional Networking', 'South Africa', 'Digital Presence', 'Personal Branding'],
    featured: true,
    keywords: ['LinkedIn optimization South Africa', 'LinkedIn profile tips SA', 'professional networking SA', 'LinkedIn recruiter search', 'SA LinkedIn strategy'],
    summary: `By the ATSBoost Team - Digital presence and networking specialists

LinkedIn has become the primary professional networking platform in South Africa, with 85% of recruiters using it for candidate sourcing. An optimized profile increases visibility by 40x and generates 5x more connection requests.

Key optimization elements include keyword-rich headlines targeting your industry, compelling summaries showcasing achievements, and complete experience sections with quantified results.

South African professionals should emphasize local market knowledge, transformation experience, and multilingual capabilities. Industry-specific keywords improve discoverability in recruiter searches.

Active engagement through content sharing, commenting, and networking significantly boosts profile visibility. LinkedIn algorithm favors consistent activity and meaningful interactions.

Professional headshots, skill endorsements, and recommendations add credibility. Many opportunities come through warm introductions rather than cold applications.

Maximize your LinkedIn presence with our comprehensive optimization service at https://atsboost.co.za.`
  },
  {
    id: '12',
    title: 'Graduate CV Templates and Tips for South African New Entrants',
    description: 'Essential CV guidance for South African graduates entering the job market, including templates, internship highlighting, and entry-level strategies.',
    publishDate: '2025-01-16',
    readTime: '10 min',
    category: 'Graduate',
    tags: ['Graduate CV', 'Entry Level', 'South Africa', 'New Graduates', 'Career Start'],
    featured: false,
    keywords: ['graduate CV South Africa', 'entry level CV tips', 'SA graduate jobs', 'internship CV', 'new graduate resume'],
    summary: `By the ATSBoost Team - Graduate career development specialists

South African graduates face unique challenges entering a competitive job market. With youth unemployment at concerning levels, strategic CV positioning becomes crucial for landing that first professional role.

Key strategies include highlighting academic achievements, internship experience, and relevant project work. Many graduates underestimate the value of part-time work, volunteer activities, and leadership roles in student organizations.

Skills-based CV formats work well for graduates with limited work experience. Focus on transferable skills gained through education, projects, and extracurricular activities.

Graduate programs at major South African companies actively recruit through university partnerships. Understanding application timelines and requirements is essential for success.

Digital literacy, adaptability, and willingness to learn are highly valued by employers hiring graduates. Emphasize these qualities with specific examples.

Access graduate-specific CV templates and career guidance at https://atsboost.co.za.`
  },
  {
    id: '13',
    title: 'Personal Branding for Job Search Success in South Africa',
    description: 'Build a powerful personal brand that resonates with South African employers and sets you apart in competitive job markets.',
    publishDate: '2025-01-15',
    readTime: '15 min',
    category: 'Personal Branding',
    tags: ['Personal Branding', 'Professional Identity', 'South Africa', 'Career Strategy', 'Digital Presence'],
    featured: false,
    keywords: ['personal branding South Africa', 'professional identity SA', 'career branding tips', 'SA job market positioning', 'professional reputation'],
    summary: `By the ATSBoost Team - Personal branding and career strategy experts

Personal branding has become essential for career success in South Africa's competitive job market. A strong professional brand differentiates you from other candidates and creates memorable impressions with employers.

Key elements include defining your unique value proposition, consistent messaging across all professional touchpoints, and demonstrating expertise through thought leadership.

South African professionals benefit from showcasing cultural intelligence, transformation leadership, and local market expertise as part of their brand identity.

Digital presence management through LinkedIn, professional websites, and industry platforms amplifies your brand reach. Content creation and engagement demonstrate expertise and thought leadership.

Networking and relationship building support brand development. Many opportunities come through referrals and professional connections rather than traditional applications.

Authenticity is crucial - your brand should reflect genuine strengths and values rather than manufactured personas.

Develop your professional brand strategy with expert guidance at https://atsboost.co.za.`
  },
  {
    id: '14',
    title: 'AI Tools for Resume Optimization: Complete South African Guide',
    description: 'Comprehensive guide to AI-powered tools for CV optimization, including local platforms and international options suitable for South African job seekers.',
    publishDate: '2025-01-14',
    readTime: '11 min',
    category: 'AI Tools',
    tags: ['AI Tools', 'Resume Optimization', 'Technology', 'South Africa', 'Career Tech'],
    featured: true,
    keywords: ['AI resume tools South Africa', 'CV optimization software', 'AI job search tools', 'resume AI technology', 'automated CV improvement'],
    summary: `By the ATSBoost Team - AI and career technology specialists

Artificial Intelligence is revolutionizing resume optimization and job search processes. South African professionals can leverage these technologies to significantly improve their application success rates.

AI tools offer keyword optimization, ATS compatibility analysis, content suggestions, and formatting improvements. Advanced platforms provide industry-specific recommendations and real-time feedback.

Popular international tools include Resumeworded, Zety, and Jobscan, while local solutions like ATSBoost.co.za offer South African market specialization including B-BBEE considerations and NQF formatting.

AI-powered job matching platforms analyze your profile against thousands of opportunities, providing compatibility scores and application prioritization guidance.

Benefits include objective analysis, time savings, and continuous improvement based on market feedback. However, human oversight remains important for authenticity and personal touch.

Future developments include video analysis, skills gap identification, and predictive career planning based on market trends.

Experience cutting-edge AI optimization technology at https://atsboost.co.za - designed specifically for the South African market.`
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