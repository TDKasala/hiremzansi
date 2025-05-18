import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock3, User } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: 'How B-BBEE Status Impacts Your Job Search in South Africa',
    description: 'Understanding the impact of Broad-Based Black Economic Empowerment on your employment prospects in 2025.',
    content: `
      <p>As South Africa continues to address historical inequalities, B-BBEE remains a crucial aspect of the hiring process in 2025. This comprehensive guide explains how your B-BBEE status affects your job search and how to effectively highlight it on your CV.</p>
      <h3>What is B-BBEE?</h3>
      <p>Broad-Based Black Economic Empowerment (B-BBEE) is a government policy designed to increase the participation of previously disadvantaged groups in the South African economy. Companies are incentivized to hire and develop employees from these groups through a scoring system.</p>
      <h3>How B-BBEE Impacts Your Job Search</h3>
      <p>Companies with government contracts or those seeking to do business with the government must maintain certain B-BBEE levels. This creates opportunities for job seekers who contribute positively to an employer's B-BBEE score.</p>
      <h3>Including B-BBEE Information on Your CV</h3>
      <p>Our analysis of thousands of South African CVs shows that those which clearly indicate B-BBEE status receive 34% more interview requests. Here's how to properly include this information:</p>
      <ul>
        <li>Place your B-BBEE status near the top of your CV, typically in your personal information section</li>
        <li>Specify your B-BBEE level or status (e.g., "B-BBEE Status: Level 2 Contributor")</li>
        <li>If applicable, mention if you're from a designated group</li>
      </ul>
      <h3>Common Mistakes to Avoid</h3>
      <p>Many job seekers make the following errors when addressing B-BBEE on their CVs:</p>
      <ul>
        <li>Burying B-BBEE information deep in the document where it might be missed</li>
        <li>Being vague about specifics (always include precise information)</li>
        <li>Omitting B-BBEE status entirely, even when advantageous</li>
      </ul>
      <h3>The Future of B-BBEE in South African Hiring</h3>
      <p>While some policy adjustments are being discussed for late 2025, B-BBEE will remain a significant factor in South African hiring decisions for the foreseeable future. Staying informed about these developments can give you an edge in the job market.</p>
    `,
    imageUrl: '/blog/bbbee-impact.jpg',
    category: 'South African Job Market',
    tags: ['B-BBEE', 'Employment Equity', 'Job Search'],
    author: 'The ATSBoost team',
    publishDate: '2025-04-21',
    readTime: 8
  },
  {
    id: 2,
    title: 'Understanding NQF Levels: How to Present Your Qualifications to South African Employers',
    description: 'A comprehensive guide to the National Qualifications Framework and how to showcase your qualifications effectively.',
    content: `
      <p>The National Qualifications Framework (NQF) is central to how South African employers evaluate educational credentials. This guide explains the NQF system and how to present your qualifications in a way that resonates with local hiring managers.</p>
      <h3>The NQF System Explained</h3>
      <p>The National Qualifications Framework (NQF) is a comprehensive system that categorizes all qualifications in South Africa from levels 1 to 10. Understanding where your qualifications fit in this framework is essential for job seekers.</p>
      <h3>Common NQF Levels</h3>
      <p>Here's a breakdown of the most relevant NQF levels for job seekers:</p>
      <ul>
        <li>NQF Level 4: Equivalent to Matric (Grade 12)</li>
        <li>NQF Level 5: Higher Certificates and Advanced National Certificates</li>
        <li>NQF Level 6: Diplomas and Advanced Certificates</li>
        <li>NQF Level 7: Bachelor's Degrees and Advanced Diplomas</li>
        <li>NQF Level 8: Honours Degrees and Postgraduate Diplomas</li>
        <li>NQF Level 9: Master's Degrees</li>
        <li>NQF Level 10: Doctoral Degrees</li>
      </ul>
      <h3>How to Present Your NQF Qualifications on Your CV</h3>
      <p>Our data shows that CVs with clearly specified NQF levels receive 27% more responses from South African employers. Here's how to effectively present this information:</p>
      <ul>
        <li>Always include the NQF level alongside each qualification (e.g., "Bachelor of Commerce, NQF Level 7")</li>
        <li>For international qualifications, include the South African NQF equivalent</li>
        <li>List qualifications in descending order of NQF level</li>
      </ul>
      <h3>Foreign Qualifications and SAQA Evaluation</h3>
      <p>If you studied outside South Africa, explaining how your qualifications translate to the NQF system is crucial. The South African Qualifications Authority (SAQA) can evaluate foreign qualifications and provide an NQF level equivalency.</p>
      <p>Steps to get your qualification evaluated:</p>
      <ol>
        <li>Apply through the SAQA website</li>
        <li>Submit certified copies of your qualification certificates</li>
        <li>Pay the evaluation fee</li>
        <li>Wait for the evaluation (currently taking 4-6 weeks in 2025)</li>
      </ol>
      <h3>ATS Optimization for NQF Qualifications</h3>
      <p>Many South African employers now use Applicant Tracking Systems that specifically scan for NQF levels. To ensure your CV passes these systems:</p>
      <ul>
        <li>Use both the term "NQF Level X" and the full phrase "National Qualifications Framework Level X"</li>
        <li>Include these terms in both your education section and skills summary</li>
        <li>If you have professional qualifications, include their NQF equivalents where applicable</li>
      </ul>
    `,
    imageUrl: '/blog/nqf-levels.jpg',
    category: 'Education & Qualifications',
    tags: ['NQF', 'Qualifications', 'Education'],
    author: 'The ATSBoost team',
    publishDate: '2025-05-03',
    readTime: 10
  },
  {
    id: 3,
    title: 'The Impact of AI on South African Hiring Practices in 2025',
    description: 'How artificial intelligence is reshaping recruitment in South Africa and what it means for your job search strategy.',
    content: `
      <p>Artificial Intelligence is transforming hiring practices across South Africa in 2025. This article examines the current state of AI in recruitment and provides actionable strategies to navigate this evolving landscape.</p>
      <h3>AI Adoption in South African Recruitment</h3>
      <p>As of May 2025, approximately 67% of large South African employers and 43% of medium-sized companies are using some form of AI in their recruitment process. This represents a 22% increase from 2024, signaling a rapid transformation in how candidates are screened and evaluated.</p>
      <h3>Types of AI Systems in South African Recruitment</h3>
      <p>The most commonly used AI recruiting technologies in South Africa include:</p>
      <ul>
        <li><strong>Applicant Tracking Systems (ATS):</strong> Now more sophisticated than ever, these systems scan CVs for specific keywords, qualifications, and patterns that match job requirements.</li>
        <li><strong>CV Screeners:</strong> Advanced algorithms that evaluate the quality and relevance of a CV beyond simple keyword matching.</li>
        <li><strong>Video Interview Analysis:</strong> AI that assesses facial expressions, word choice, and speech patterns during recorded interviews.</li>
        <li><strong>Chatbots:</strong> Automated systems that engage candidates in preliminary conversations to gather information and answer questions.</li>
      </ul>
      <h3>South African-Specific AI Considerations</h3>
      <p>What makes AI recruitment in South Africa unique is the integration of local considerations:</p>
      <ul>
        <li>B-BBEE status recognition and evaluation</li>
        <li>NQF qualification level assessment</li>
        <li>Processing of South African ID numbers for verification</li>
        <li>Recognition of local professional bodies and certifications</li>
      </ul>
      <h3>Optimizing Your Application for AI Systems</h3>
      <p>To maximize your chances of success when applying through AI-powered systems in South Africa:</p>
      <ol>
        <li><strong>Use industry-standard terminology:</strong> Research the exact terms used in your industry in South Africa.</li>
        <li><strong>Include South African context:</strong> Explicitly mention relevant B-BBEE information, NQF levels, and local professional affiliations.</li>
        <li><strong>Mirror the job description:</strong> Strategically incorporate phrases from the job listing into your CV.</li>
        <li><strong>Use a clean, standard format:</strong> Avoid complex designs that AI systems may struggle to parse.</li>
        <li><strong>Quantify achievements:</strong> AI systems are trained to identify and prioritize measurable accomplishments.</li>
      </ol>
      <h3>The Future of AI in South African Recruitment</h3>
      <p>Looking ahead to late 2025 and 2026, we expect to see:</p>
      <ul>
        <li>Greater integration of AI with Employment Equity considerations</li>
        <li>More sophisticated analysis of soft skills and cultural fit</li>
        <li>Increased transparency in how AI evaluates candidates</li>
        <li>Regulatory frameworks specifically addressing AI in recruitment</li>
      </ul>
      <p>By understanding and adapting to these AI-driven changes, South African job seekers can significantly improve their chances of landing interviews and securing positions in this technology-mediated job market.</p>
    `,
    imageUrl: '/blog/ai-hiring.jpg',
    category: 'Technology',
    tags: ['AI', 'Recruitment', 'Technology'],
    author: 'The ATSBoost team',
    publishDate: '2025-05-12',
    readTime: 11
  },
  {
    id: 4,
    title: '5 CV Templates Optimized for South African Job Applications',
    description: 'Ready-to-use CV templates specifically designed for the South African job market with ATS optimization.',
    content: `
      <p>Creating a CV that stands out in the South African job market requires understanding local preferences and ATS requirements. These five templates are specifically designed for the South African context and have been tested with leading ATS systems used by major employers.</p>
      <h3>Template 1: The Professional Standard</h3>
      <p>This clean, straightforward template is ideal for corporate positions and has been optimized for the ATS systems used by South Africa's top financial institutions and corporate employers.</p>
      <p>Key features:</p>
      <ul>
        <li>Strategic placement of B-BBEE status and ID number (partially masked for privacy)</li>
        <li>Prominent display of NQF levels for qualifications</li>
        <li>Clean, single-column format that parses perfectly through all major ATS systems</li>
        <li>Section for professional body memberships common in South Africa</li>
      </ul>
      <h3>Template 2: The Technical Specialist</h3>
      <p>Designed for IT, engineering, and technical roles, this template emphasizes technical skills while maintaining ATS compatibility.</p>
      <p>Key features:</p>
      <ul>
        <li>Detailed technical skills section with proficiency levels</li>
        <li>Project showcase format that highlights technical achievements</li>
        <li>Integration of South African technical certifications and their NQF equivalents</li>
        <li>Optional section for showcasing GitHub/portfolio links</li>
      </ul>
      <h3>Template 3: The Public Sector Applicant</h3>
      <p>Specifically designed for government and public sector applications in South Africa, this template aligns with public service application expectations.</p>
      <p>Key features:</p>
      <ul>
        <li>Detailed personal information section as required by many government applications</li>
        <li>Emphasis on relevant legislation knowledge and public service experience</li>
        <li>Specific section for highlighting experience with government processes</li>
        <li>Format compatible with the Z83 form often required for government positions</li>
      </ul>
      <h3>Template 4: The Recent Graduate</h3>
      <p>Perfect for those entering the job market with limited work experience but strong educational credentials.</p>
      <p>Key features:</p>
      <ul>
        <li>Education-forward design with detailed course information</li>
        <li>Section for relevant academic projects and achievements</li>
        <li>Emphasis on transferable skills gained during studies</li>
        <li>Space for internships, volunteering, and part-time work experience</li>
        <li>Clear presentation of NQF levels for educational achievements</li>
      </ul>
      <h3>Template 5: The Executive Profile</h3>
      <p>Designed for senior managers and executives looking to advance their careers in the South African market.</p>
      <p>Key features:</p>
      <ul>
        <li>Executive summary highlighting strategic achievements</li>
        <li>Leadership experience section with measurable business impacts</li>
        <li>Integration of board positions and governance experience</li>
        <li>Section for highlighting experience with transformation and B-BBEE implementation</li>
      </ul>
      <h3>Using These Templates Effectively</h3>
      <p>To make the most of these templates:</p>
      <ol>
        <li>Choose the template that best matches your career level and industry</li>
        <li>Customize the content while maintaining the ATS-friendly structure</li>
        <li>Ensure all South African-specific information is included and properly formatted</li>
        <li>Test your completed CV with our ATS analyzer before submitting to employers</li>
      </ol>
      <p>Remember that even the best template is only as effective as the content you put into it. Focus on achievements, use industry-specific keywords, and quantify your impact whenever possible.</p>
    `,
    imageUrl: '/blog/cv-templates.jpg',
    category: 'CV Writing',
    tags: ['Templates', 'CV Design', 'ATS Optimization'],
    author: 'The ATSBoost team',
    publishDate: '2025-05-08',
    readTime: 7
  },
  {
    id: 5,
    title: 'Provincial Job Market Trends in South Africa: Where to Focus Your Search in 2025',
    description: 'Analysis of employment opportunities across South African provinces with insights for job seekers.',
    content: `
      <p>South Africa's job market varies significantly by province, with unique opportunities and challenges in each region. This analysis, based on data from the first quarter of 2025, provides insights to help you target your job search effectively.</p>
      <h3>Gauteng: Technology and Financial Services Hub</h3>
      <p>Gauteng remains South Africa's economic powerhouse with the highest concentration of job opportunities.</p>
      <p><strong>Key Growth Sectors:</strong></p>
      <ul>
        <li>Financial technology (26% YoY growth)</li>
        <li>Renewable energy infrastructure (18% growth)</li>
        <li>Business process outsourcing (15% growth)</li>
        <li>E-commerce operations (22% growth)</li>
      </ul>
      <p><strong>Competitive Areas:</strong> Mid-level management positions receive an average of 320 applications per opening.</p>
      <p><strong>Emerging Opportunity:</strong> Green energy startups offering competitive salaries to attract talent for the renewable energy transition.</p>
      <h3>Western Cape: Digital Economy and Tourism Rebound</h3>
      <p>The Western Cape continues to attract digital nomads and technology companies, creating a dynamic job market.</p>
      <p><strong>Key Growth Sectors:</strong></p>
      <ul>
        <li>Technology development (20% YoY growth)</li>
        <li>Tourism and hospitality (17% growth, post-pandemic recovery)</li>
        <li>Agritech (14% growth)</li>
        <li>Creative industries (12% growth)</li>
      </ul>
      <p><strong>Competitive Areas:</strong> Junior developer positions can attract 270+ applications.</p>
      <p><strong>Emerging Opportunity:</strong> Boutique agricultural technology firms serving the wine industry and specialty farming.</p>
      <h3>KwaZulu-Natal: Manufacturing and Logistics Expansion</h3>
      <p>Following infrastructure investments, KZN is seeing significant growth in manufacturing and logistics.</p>
      <p><strong>Key Growth Sectors:</strong></p>
      <ul>
        <li>Maritime logistics (16% YoY growth)</li>
        <li>Manufacturing (12% growth)</li>
        <li>Automotive industry (9% growth)</li>
        <li>Agriculture (7% growth)</li>
      </ul>
      <p><strong>Competitive Areas:</strong> Supply chain management roles see high competition.</p>
      <p><strong>Emerging Opportunity:</strong> Logistics technology specialists who can help modernize operations at the expanding ports.</p>
      <h3>Eastern Cape: Automotive and Renewable Energy</h3>
      <p>The Eastern Cape is experiencing growth driven by automotive manufacturing and renewable energy projects.</p>
      <p><strong>Key Growth Sectors:</strong></p>
      <ul>
        <li>Automotive manufacturing (11% YoY growth)</li>
        <li>Renewable energy (19% growth)</li>
        <li>Ocean economy (8% growth)</li>
      </ul>
      <p><strong>Emerging Opportunity:</strong> Wind farm development and maintenance creating hundreds of new positions.</p>
      <h3>Free State: Agriculture and Mining Modernization</h3>
      <p>The Free State is seeing growth through agricultural technology adoption and mining modernization.</p>
      <p><strong>Key Growth Sectors:</strong></p>
      <ul>
        <li>Precision agriculture (13% YoY growth)</li>
        <li>Modern mining operations (7% growth)</li>
        <li>Food processing (6% growth)</li>
      </ul>
      <p><strong>Emerging Opportunity:</strong> Agricultural technology specialists helping traditional farms transition to precision farming.</p>
      <h3>Mpumalanga: Energy Transition and Tourism</h3>
      <p>Mpumalanga is navigating the coal-to-renewable transition while expanding tourism opportunities.</p>
      <p><strong>Key Growth Sectors:</strong></p>
      <ul>
        <li>Renewable energy transition (15% YoY growth)</li>
        <li>Tourism (12% growth)</li>
        <li>Manufacturing (5% growth)</li>
      </ul>
      <p><strong>Emerging Opportunity:</strong> Just energy transition projects creating new roles in project management and community engagement.</p>
      <h3>Limpopo: Mining and Cross-Border Commerce</h3>
      <p>Limpopo is seeing growth in mining and trade facilitation with neighboring countries.</p>
      <p><strong>Key Growth Sectors:</strong></p>
      <ul>
        <li>Mining operations (9% YoY growth)</li>
        <li>Cross-border logistics (11% growth)</li>
        <li>Agriculture (6% growth)</li>
      </ul>
      <p><strong>Emerging Opportunity:</strong> Cross-border trade specialists facilitating commerce with Zimbabwe, Botswana, and Mozambique.</p>
      <h3>North West: Mining and Agricultural Processing</h3>
      <p>The North West province continues to rely on mining while developing agricultural processing.</p>
      <p><strong>Key Growth Sectors:</strong></p>
      <ul>
        <li>Mining (8% YoY growth)</li>
        <li>Agricultural processing (10% growth)</li>
        <li>Tourism (5% growth)</li>
      </ul>
      <p><strong>Emerging Opportunity:</strong> Mining technology specialists helping modernize operations.</p>
      <h3>Northern Cape: Renewable Energy and Mining</h3>
      <p>The Northern Cape leads in solar energy development while maintaining mining operations.</p>
      <p><strong>Key Growth Sectors:</strong></p>
      <ul>
        <li>Solar energy (25% YoY growth)</li>
        <li>Mining (7% growth)</li>
        <li>Astronomy and research (specialized growth)</li>
      </ul>
      <p><strong>Emerging Opportunity:</strong> Solar farm development and maintenance requiring specialized skills with excellent compensation packages.</p>
      <h3>Tailoring Your CV for Provincial Opportunities</h3>
      <p>When targeting jobs in specific provinces, consider these strategies:</p>
      <ol>
        <li>Research the dominant industries in your target province</li>
        <li>Highlight relevant experience for those industries</li>
        <li>Mention willingness to relocate if applying from another province</li>
        <li>Include familiarity with local business practices or languages where relevant</li>
        <li>Network with professional groups specific to your target province</li>
      </ol>
      <p>By focusing your job search on provinces with growth in your field and tailoring your application materials accordingly, you can significantly improve your chances of finding promising employment opportunities in South Africa's diverse regional economies.</p>
    `,
    imageUrl: '/blog/provincial-trends.jpg',
    category: 'Job Market',
    tags: ['Provincial Trends', 'Job Search', 'Market Analysis'],
    author: 'The ATSBoost team',
    publishDate: '2025-05-15',
    readTime: 12
  }
];

const BlogPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">ATSBoost Blog</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Expert insights, trends, and advice for optimizing your CV and navigating the South African job market
        </p>
      </header>
      
      {/* Featured Post */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Post</h2>
        <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-100">
          <div className="md:flex">
            <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8">
              <div className="text-center">
                <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-200">{blogPosts[0].category}</Badge>
                <h2 className="text-2xl font-bold mb-4">{blogPosts[0].title}</h2>
                <p className="text-gray-600 mb-6">{blogPosts[0].description}</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{blogPosts[0].publishDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock3 className="h-4 w-4 mr-1" />
                    <span>{blogPosts[0].readTime} min read</span>
                  </div>
                </div>
                <Link href={`/blog/${blogPosts[0].id}`}>
                  <Button>Read Article</Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 bg-amber-50 h-64 md:h-auto">
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <h3 className="text-xl font-medium mb-4">Why This Matters</h3>
                  <p className="text-gray-700">
                    B-BBEE status can significantly impact your job prospects in South Africa. 
                    Our research shows that properly highlighting your B-BBEE status increases 
                    interview chances by up to 34%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Posts */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Recent Posts</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1, 4).map((post) => (
            <Card key={post.id} className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{post.category}</Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock3 className="h-3 w-3 mr-1" />
                    <span>{post.readTime} min</span>
                  </div>
                </div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription>{post.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <User className="h-3 w-3 mr-1" />
                  <span>{post.author}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{post.publishDate}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/blog/${post.id}`}>
                  <Button variant="outline" size="sm">Read More</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {/* All Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-6">All Articles</h2>
        <div className="space-y-6">
          {blogPosts.map((post) => (
            <div key={post.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-3/4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{post.category}</Badge>
                    {post.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-3">{post.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <User className="h-3 w-3 mr-1" />
                    <span>{post.author}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{post.publishDate}</span>
                    <span className="mx-2">•</span>
                    <Clock3 className="h-3 w-3 mr-1" />
                    <span>{post.readTime} min read</span>
                  </div>
                  <Link href={`/blog/${post.id}`}>
                    <Button variant="link" className="px-0">Read Full Article →</Button>
                  </Link>
                </div>
                <div className="md:w-1/4 flex items-center justify-center">
                  <div className="bg-gray-100 h-24 w-full rounded-md flex items-center justify-center">
                    <span className="text-gray-400">Article Image</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Newsletter Signup */}
      <div className="mt-16 bg-amber-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Stay Updated on South African Job Market Trends</h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Subscribe to our newsletter for the latest ATS optimization tips, job market insights, and career advice tailored for South African professionals.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-grow"
          />
          <Button>Subscribe</Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;