import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Users, 
  Heart, 
  Zap, 
  Shield, 
  Target, 
  ArrowRight,
  Briefcase,
  UserCheck,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";

export default function PremiumMatchingSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2">
            <Bot className="w-4 h-4 mr-2" />
            COMING SOON: AI-Powered Job Matching
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Premium Job Matching Service (Coming Soon)
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're developing an advanced AI system that will analyze CVs and job requirements to create high-quality matches. 
            Stay tuned for this exciting feature that will connect South African talent with the right opportunities.
          </p>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 animate-fade-in-up">
          <Card className="text-center border-2 hover:border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Bot className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <CardTitle className="text-xl">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our AI analyzes your CV/job posting against thousands of data points including skills, 
                experience, location, salary, and South African market factors.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
                <Heart className="w-8 h-8 text-green-600 animate-bounce" />
              </div>
              <CardTitle className="text-xl">Quality Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Only matches with 70%+ compatibility are shown. You see match scores, 
                skills alignment, and reasons why you're a great fit - but contact details stay hidden.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
                <Users className="w-8 h-8 text-purple-600 hover:animate-spin" />
              </div>
              <CardTitle className="text-xl">Mutual Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Both parties pay to unlock contact details (R50 for job seekers, R200 for recruiters). This ensures serious, 
                committed connections and eliminates time-wasters.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* For Job Seekers */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="flex items-center text-2xl">
                <UserCheck className="w-6 h-6 mr-3" />
                For Job Seekers
              </CardTitle>
              <CardDescription className="text-blue-100">
                Find opportunities that match your skills and aspirations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Target className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Get matched with jobs that fit your skills and experience level</span>
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>See detailed match scores and exactly why you're a good fit</span>
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Only pay R50 when you find a job you're excited about</span>
                </li>
                <li className="flex items-start">
                  <DollarSign className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>South African salary and location matching included</span>
                </li>
              </ul>
              <Button className="w-full mt-6 bg-gray-400 cursor-not-allowed" disabled>
                Coming Soon <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* For Recruiters */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <CardTitle className="flex items-center text-2xl">
                <Briefcase className="w-6 h-6 mr-3" />
                For Recruiters
              </CardTitle>
              <CardDescription className="text-purple-100">
                Find qualified candidates who are genuinely interested
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Target className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>AI finds candidates with the exact skills and experience you need</span>
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Pre-screened candidates based on B-BBEE, NQF levels, and location</span>
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Only pay R200 per contact for verified, qualified candidates</span>
                </li>
                <li className="flex items-start">
                  <DollarSign className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Reduce time-to-hire and improve candidate quality</span>
                </li>
              </ul>
              <Button className="w-full mt-6 bg-gray-400 cursor-not-allowed" disabled>
                Coming Soon <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Job Matching Coming Soon!
          </h3>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            We're building an advanced AI-powered job matching system specifically for the South African market. 
            Stay tuned for this exciting feature!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gray-500 cursor-not-allowed" disabled>
              Job Matching Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}