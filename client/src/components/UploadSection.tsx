import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimpleUploadForm from "@/components/SimpleUploadForm";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Lightbulb, Briefcase, MapPin, Clock, Users, Building2, Star, TrendingUp } from "lucide-react";

export default function UploadSection() {
  const [uploadComplete, setUploadComplete] = useState(false);
  
  const handleUploadComplete = (data: any) => {
    setUploadComplete(true);
  };

  return (
    <section id="upload-section" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your Career Hub: Upload CVs & Discover Opportunities
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Job seekers: Get your CV optimized for South African ATS systems. Recruiters: Post jobs and find top talent with AI-powered matching.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          
          {/* Job Seekers Section */}
          <Card className="bg-white shadow-lg overflow-hidden border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Job Seekers</CardTitle>
                  <p className="text-sm text-gray-600">Optimize your CV for South African employers</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <SimpleUploadForm onUploadComplete={handleUploadComplete} />
              
              <div className="p-6">
                <div className="flex items-start space-x-3 bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium mb-1">Did you know?</h3>
                    <p className="text-sm text-neutral-600">
                      Over 75% of South African companies use ATS systems to filter CVs. 
                      <Link href="/blog/ATSSurvivalGuide2025" className="text-primary font-medium hover:underline ml-1">
                        Learn how to pass through these filters <ArrowRight className="h-3 w-3 inline" />
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recruiters Section */}
          <Card className="bg-white shadow-lg overflow-hidden border-l-4 border-l-green-500">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Recruiters</CardTitle>
                  <p className="text-sm text-gray-600">Post jobs and find qualified South African talent</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Quick Post Job Form */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                  Post a Job Opening
                </h3>
                
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Job Title (e.g., Senior Software Developer)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Company Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option>Location</option>
                      <option>Johannesburg</option>
                      <option>Cape Town</option>
                      <option>Durban</option>
                      <option>Pretoria</option>
                      <option>Port Elizabeth</option>
                      <option>Remote</option>
                    </select>
                    <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option>Job Type</option>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>
                  <textarea 
                    placeholder="Brief job description and key requirements..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="space-y-3">
                  <Link href="/premium-matching/recruiter">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 text-base font-medium">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Post Job & Find Candidates (R200)
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 py-3">
                      Create Free Recruiter Account
                    </Button>
                  </Link>
                </div>
              </div>

              <Separator />

              {/* Recent Job Posts */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-green-600" />
                  Latest Job Opportunities
                </h3>
                
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">Senior Software Engineer</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">R45k - R65k</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center"><Building2 className="h-4 w-4 mr-1" />TechCorp SA</span>
                      <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />Cape Town</span>
                      <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />Full-time</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">Looking for experienced React/Node.js developer with 5+ years experience...</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex space-x-2">
                        <Badge variant="outline" className="text-xs">React</Badge>
                        <Badge variant="outline" className="text-xs">Node.js</Badge>
                        <Badge variant="outline" className="text-xs">TypeScript</Badge>
                      </div>
                      <span className="text-xs text-gray-500">2 days ago</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">Marketing Manager</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">R35k - R50k</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center"><Building2 className="h-4 w-4 mr-1" />Growth Agency</span>
                      <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />Johannesburg</span>
                      <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />Full-time</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">Seeking creative marketing professional with digital marketing expertise...</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex space-x-2">
                        <Badge variant="outline" className="text-xs">Digital Marketing</Badge>
                        <Badge variant="outline" className="text-xs">Analytics</Badge>
                        <Badge variant="outline" className="text-xs">B-BBEE</Badge>
                      </div>
                      <span className="text-xs text-gray-500">1 week ago</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">Financial Analyst</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">R28k - R40k</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center"><Building2 className="h-4 w-4 mr-1" />JSE Listed Co.</span>
                      <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />Sandton</span>
                      <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />Full-time</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">Junior to mid-level financial analyst position with growth opportunities...</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex space-x-2">
                        <Badge variant="outline" className="text-xs">Excel</Badge>
                        <Badge variant="outline" className="text-xs">Financial Modeling</Badge>
                        <Badge variant="outline" className="text-xs">CFA</Badge>
                      </div>
                      <span className="text-xs text-gray-500">3 days ago</span>
                    </div>
                  </div>
                </div>

                <Link href="/jobs">
                  <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                    <Users className="h-4 w-4 mr-2" />
                    View All Job Opportunities
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Recruiter Benefits */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900">Why choose ATSBoost for recruiting?</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>AI-powered candidate matching with 85% accuracy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>B-BBEE status verification and compliance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>50,000+ qualified South African professionals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>NQF-level education verification</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">50,000+</div>
              <div className="text-sm text-gray-600">CVs Optimized</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">2,500+</div>
              <div className="text-sm text-gray-600">Jobs Posted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">85%</div>
              <div className="text-sm text-gray-600">Match Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">500+</div>
              <div className="text-sm text-gray-600">Partner Companies</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}