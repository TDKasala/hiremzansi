import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Target,
  CreditCard,
  Search,
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  Star,
  ArrowRight,
  Building2,
  Eye,
  Bell
} from 'lucide-react';

export function PremiumRecruiterSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-800 px-4 py-2">
            For Recruiters
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Premium Candidate Matching
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access pre-screened, AI-matched candidates for your job postings. 
            Pay only when you find the perfect match for your organization.
          </p>
        </div>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Post Private Jobs</h3>
              <p className="text-gray-600">
                Create confidential job postings that remain hidden from public view. 
                Our AI analyzes requirements against existing candidate CVs.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Smart Matches</h3>
              <p className="text-gray-600">
                Receive instant notifications when candidates match your criteria. 
                View detailed compatibility scores and skill breakdowns.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Pay Per Contact</h3>
              <p className="text-gray-600">
                Only pay R200-250 when you decide to unlock a candidate's 
                full contact details and professional profile.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Features List */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Why Choose Our Premium Matching?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">South African Context</h4>
                  <p className="text-gray-600">B-BBEE compliance, NQF levels, and local industry experience matching</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Confidential Hiring</h4>
                  <p className="text-gray-600">Private job postings invisible to public job boards and competitors</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Zap className="h-6 w-6 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Instant Matching</h4>
                  <p className="text-gray-600">AI analyzes CVs in real-time against your job requirements</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Quality Scoring</h4>
                  <p className="text-gray-600">Detailed match percentages for skills, experience, and location preferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Dashboard Preview */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Your Matches Dashboard</h4>
              <Badge className="bg-green-100 text-green-800">2 New</Badge>
            </div>
            
            {/* Sample Match Cards */}
            <div className="space-y-3">
              <div className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">92%</span>
                      </div>
                      <span className="font-medium text-gray-900">Senior Project Manager</span>
                    </div>
                    <p className="text-sm text-gray-600">Johannesburg • 8+ years • B-BBEE Level 1</p>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Eye className="h-4 w-4 mr-1" />
                    R250
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">Project Management</Badge>
                  <Badge variant="secondary" className="text-xs">Agile</Badge>
                  <Badge variant="secondary" className="text-xs">SAP</Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">87%</span>
                      </div>
                      <span className="font-medium text-gray-900">Full Stack Developer</span>
                    </div>
                    <p className="text-sm text-gray-600">Cape Town • 5+ years • B-BBEE Level 2</p>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Eye className="h-4 w-4 mr-1" />
                    R200
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">React</Badge>
                  <Badge variant="secondary" className="text-xs">Node.js</Badge>
                  <Badge variant="secondary" className="text-xs">PostgreSQL</Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                View All Matches
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
            <div className="text-gray-600">Active Candidates</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
            <div className="text-gray-600">Average Match Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">24h</div>
            <div className="text-gray-600">Average Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">95%</div>
            <div className="text-gray-600">Recruiter Satisfaction</div>
          </div>
        </div>

        {/* Job Seeker Benefits */}
        <div className="bg-white rounded-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              How Job Seekers Benefit
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              While recruiters find talent, our candidates receive valuable feedback 
              without ever seeing the job details or company information.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Anonymous Notifications</h4>
              <p className="text-sm text-gray-600">
                Get alerts about potential matches without revealing job or company details
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">CV Optimization Tips</h4>
              <p className="text-sm text-gray-600">
                Receive specific suggestions to improve your CV based on market demand
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Skill Gap Analysis</h4>
              <p className="text-sm text-gray-600">
                Learn which skills are in demand and how to position yourself better
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Find Your Next Star Employee?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join leading South African companies using our premium matching service 
            to find quality candidates efficiently and confidentially.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/recruiter/matches">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Building2 className="h-5 w-5 mr-2" />
                Start Recruiting Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/recruiter/matches">
              <Button size="lg" variant="outline">
                <Search className="h-5 w-5 mr-2" />
                Get Started
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No setup fees • Pay per successful match • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}