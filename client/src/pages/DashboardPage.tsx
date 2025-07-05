import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-center sm:text-left">
        Welcome to Your Dashboard
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">My CVs</CardTitle>
            <CardDescription className="text-sm sm:text-base">Manage and analyze your CVs</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-600">Upload and optimize your CV with our AI tools.</p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/cvs">View CVs</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Job Matches</CardTitle>
            <CardDescription className="text-sm sm:text-base">See jobs that match your skills</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-600">Find South African jobs that match your qualifications.</p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/job-seeker/matches">View Matches</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Job Recommendations</CardTitle>
            <CardDescription className="text-sm sm:text-base">Personalized job suggestions</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-600">Get AI-powered job recommendations based on your CV.</p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/job-recommendations">View Recommendations</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Career Path Visualizer</CardTitle>
            <CardDescription className="text-sm sm:text-base">Explore career progression paths</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-600">Discover career opportunities and progression paths in South African industries.</p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/career-path-visualizer">Explore Careers</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Interview Practice</CardTitle>
            <CardDescription className="text-sm sm:text-base">Practice with AI-powered interviews</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-600">Improve your interview skills with personalized practice sessions.</p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/interview-practice">Start Practice</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Skill Gap Analysis</CardTitle>
            <CardDescription className="text-sm sm:text-base">Identify areas for improvement</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-600">Analyze your skills against target roles and get development recommendations.</p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/skill-gap-analysis">Analyze Skills</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Profile</CardTitle>
            <CardDescription className="text-sm sm:text-base">Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-600">Update your personal information and preferences.</p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}