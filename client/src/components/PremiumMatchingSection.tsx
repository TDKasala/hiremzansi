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
  DollarSign,
  ChevronDown
} from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function PremiumMatchingSection() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    {
      id: "how-it-works",
      title: "How AI Matching Works",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="text-center border-2 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-blue-600" />
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

          <Card className="text-center border-2 hover:border-green-200 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Quality Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Only matches with 70%+ compatibility are shown. You see match scores, 
                skills alignment, and reasons why you're a great fit.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Mutual Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Both parties pay to unlock contact details (R50 for job seekers, R200 for recruiters). 
                This ensures serious, committed connections.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "job-seekers",
      title: "For Job Seekers",
      content: (
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
      )
    },
    {
      id: "recruiters",
      title: "For Recruiters",
      content: (
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
      )
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <Badge className="mb-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 text-sm">
            <Bot className="w-3 h-3 mr-1" />
            COMING SOON: AI-Powered Job Matching
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Premium Job Matching Service (Coming Soon)
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            We're developing an advanced AI system that will analyze CVs and job requirements to create high-quality matches.
          </p>
        </div>

        {/* Dropdown Section */}
        <div className="max-w-xl mx-auto mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between text-left">
                {selectedOption ? options.find(opt => opt.id === selectedOption)?.title : "Learn more about job matching features"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[400px]">
              {options.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className="p-3 cursor-pointer hover:bg-neutral-50"
                >
                  <span className="font-medium">{option.title}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Selected Content */}
        {selectedOption && (
          <div className="max-w-4xl mx-auto mb-6">
            {options.find(opt => opt.id === selectedOption)?.content}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">
            Job Matching Coming Soon!
          </h3>
          <p className="text-gray-300 mb-4 max-w-xl mx-auto text-sm">
            We're building an advanced AI-powered job matching system specifically for the South African market.
          </p>
          <Button size="sm" className="bg-gray-500 cursor-not-allowed" disabled>
            Job Matching Coming Soon
          </Button>
        </div>
      </div>
    </section>
  );
}