import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Target, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Zap,
  CreditCard
} from 'lucide-react';

export function RecruiterCTA() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800 px-4 py-2">
            For Recruiters & Employers
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find Pre-Screened South African Talent
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access AI-matched candidates with verified skills and experience. 
            Pay only R200-250 when you find the perfect candidate for your role.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Quality Candidates</h3>
            <p className="text-gray-600">
              Access pre-screened candidates with ATS scores above 75% and verified South African credentials.
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Matching</h3>
            <p className="text-gray-600">
              Our xAI system finds candidates with 85%+ compatibility based on skills, experience, and B-BBEE requirements.
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Pay Per Success</h3>
            <p className="text-gray-600">
              No monthly fees or setup costs. Pay R200-250 only when you unlock candidate contact details.
            </p>
          </Card>
        </div>

        {/* Pricing & Process */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* How It Works */}
          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <Zap className="h-6 w-6 mr-2 text-blue-600" />
              How It Works
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Create Recruiter Profile</h4>
                  <p className="text-gray-600 text-sm">Set up your company profile with verification documents</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Post Job Requirements</h4>
                  <p className="text-gray-600 text-sm">Define your role requirements and candidate preferences</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Review AI Matches</h4>
                  <p className="text-gray-600 text-sm">See anonymous candidate profiles with match scores</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">Pay & Contact</h4>
                  <p className="text-gray-600 text-sm">Pay R200-250 to unlock full contact details and reach out</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Benefits */}
          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-green-600" />
              Why Choose Our Platform
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-700">Candidates with 75%+ ATS scores</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-700">B-BBEE compliance verification</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-700">South African market expertise</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-700">No monthly subscription fees</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-700">Secure PayFast payment processing</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-700">AI-powered skill compatibility analysis</span>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center bg-white rounded-lg p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Find Your Next Star Employee?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join leading South African companies using our premium matching service 
            to find quality candidates efficiently and cost-effectively.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link href="/recruiter/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Building2 className="h-5 w-5 mr-2" />
                Start Recruiting Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/recruiter/matches">
              <Button size="lg" variant="outline">
                <Target className="h-5 w-5 mr-2" />
                Get Started
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            No setup fees • Pay per successful contact • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}