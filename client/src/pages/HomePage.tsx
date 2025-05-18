import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, FileText, BarChart2, TrendingUp, Users, ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-50 to-amber-100 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Beat the ATS and Land Your Dream Job in South Africa
              </h1>
              <p className="text-xl text-gray-700">
                ATSBoost helps South African job seekers optimize their CVs to pass Applicant Tracking Systems and stand out to employers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white font-medium">
                  <Link href="/upload">Upload Your CV</Link>
                </Button>
                <Button variant="outline" size="lg" className="border-amber-500 text-amber-600 hover:bg-amber-50">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="relative">
                  <img 
                    src="/cv-analysis-hero.svg" 
                    alt="CV Analysis" 
                    className="relative rounded-lg shadow-lg w-full max-w-md mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <p className="text-4xl font-bold text-amber-500 mb-2">75%</p>
              <p className="text-gray-600">Of CVs are rejected by ATS before a human sees them</p>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-amber-500 mb-2">32%</p>
              <p className="text-gray-600">Unemployment rate in South Africa</p>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-amber-500 mb-2">6x</p>
              <p className="text-gray-600">Higher interview chance with an optimized CV</p>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-amber-500 mb-2">87%</p>
              <p className="text-gray-600">User success rate with ATSBoost</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How ATSBoost Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our South African-specific ATS analysis helps you optimize your CV in minutes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle>Upload Your CV</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Upload your CV in any format (PDF, DOCX, etc.) to our secure platform.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart2 className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle>Get ATS Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Our AI analyzes your CV using South African ATS criteria and provides detailed feedback.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle>Improve & Track</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Implement our suggestions and track your CV's improvement over time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose ATSBoost</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored specifically for the South African job market
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex space-x-4">
              <CheckCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">South African Context</h3>
                <p className="text-gray-600">
                  Our system understands B-BBEE, NQF levels, and other South African-specific requirements.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <CheckCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Industry-Specific Keywords</h3>
                <p className="text-gray-600">
                  Get suggestions based on your industry standards in the South African market.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <CheckCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Before & After Comparison</h3>
                <p className="text-gray-600">
                  See how your CV improves with our suggestions and track progress over time.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <CheckCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">ATS Score</h3>
                <p className="text-gray-600">
                  Get a detailed ATS compatibility score with breakdown by categories.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <CheckCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Job Description Matching</h3>
                <p className="text-gray-600">
                  Match your CV against specific job descriptions to increase your chances.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <CheckCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Mobile Friendly</h3>
                <p className="text-gray-600">
                  Use ATSBoost on any device - perfect for South African job seekers on the go.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of South Africans who have improved their job prospects
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 italic">
                  "After using ATSBoost, I landed interviews with 3 companies within a week. Two months later, I'm employed at my dream company in Cape Town!"
                </p>
                <div className="mt-4">
                  <p className="font-semibold">Thabo M.</p>
                  <p className="text-sm text-gray-500">Software Developer, Cape Town</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 italic">
                  "As a recent graduate, I was struggling to get interviews. ATSBoost helped me understand how to properly format my qualifications with NQF levels and highlight my skills."
                </p>
                <div className="mt-4">
                  <p className="font-semibold">Nomsa K.</p>
                  <p className="text-sm text-gray-500">Marketing Assistant, Johannesburg</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 italic">
                  "The South African-specific industry keywords feature gave me exactly what I needed to tailor my CV for the financial services sector. Worth every rand!"
                </p>
                <div className="mt-4">
                  <p className="font-semibold">Lerato D.</p>
                  <p className="text-sm text-gray-500">Financial Analyst, Durban</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-amber-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Boost Your Job Search?</h2>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Join thousands of South Africans who have transformed their job search with ATSBoost.
          </p>
          <Button size="lg" className="bg-white text-amber-600 hover:bg-gray-100">
            <Link href="/upload">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Latest Insights</h2>
            <Link href="/blog" className="text-amber-600 hover:text-amber-700 flex items-center">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-md h-full flex flex-col">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/blog/ats-systems-sa.jpg" 
                  alt="ATS Systems in South Africa" 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2 hover:text-amber-600">
                  <Link href="/blog/how-to-beat-ats-systems-in-south-africa">
                    How to Beat ATS Systems in South Africa: A Complete Guide
                  </Link>
                </CardTitle>
                <CardDescription>May 15, 2025 • 8 min read</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 line-clamp-3">
                  Learn how to optimize your CV to beat Applicant Tracking Systems in the South African job market with our comprehensive guide.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/blog/how-to-beat-ats-systems-in-south-africa" className="text-amber-600 hover:text-amber-700 flex items-center">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="shadow-md h-full flex flex-col">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/blog/bbbee-cv-guide.jpg" 
                  alt="B-BBEE CV Guide" 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2 hover:text-amber-600">
                  <Link href="/blog/bbbee-levels-cv-optimization-guide">
                    B-BBEE Levels and CV Optimization: The Complete South African Guide
                  </Link>
                </CardTitle>
                <CardDescription>May 10, 2025 • 6 min read</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 line-clamp-3">
                  Learn how to properly include B-BBEE information in your CV to boost your chances in the South African job market.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/blog/bbbee-levels-cv-optimization-guide" className="text-amber-600 hover:text-amber-700 flex items-center">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="shadow-md h-full flex flex-col">
              <div className="h-48 overflow-hidden">
                <img 
                  src="/blog/nqf-levels-guide.jpg" 
                  alt="NQF Levels Guide" 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2 hover:text-amber-600">
                  <Link href="/blog/nqf-levels-explained-south-african-cv">
                    NQF Levels Explained: How to Present Qualifications on Your South African CV
                  </Link>
                </CardTitle>
                <CardDescription>May 3, 2025 • 7 min read</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 line-clamp-3">
                  Master the art of correctly formatting your South African qualifications with proper NQF levels to improve your CV's ATS compatibility.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/blog/nqf-levels-explained-south-african-cv" className="text-amber-600 hover:text-amber-700 flex items-center">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;