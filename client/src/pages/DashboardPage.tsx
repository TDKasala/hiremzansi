import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Welcome to Your Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My CVs</CardTitle>
            <CardDescription>Manage and analyze your CVs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Upload and optimize your CV with our AI tools.</p>
            <Button asChild>
              <Link href="/cvs">View CVs</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Job Matches</CardTitle>
            <CardDescription>See jobs that match your skills</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Find South African jobs that match your qualifications.</p>
            <Button asChild>
              <Link href="/job-seeker/matches">View Matches</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Job Recommendations</CardTitle>
            <CardDescription>Personalized job suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Get AI-powered job recommendations based on your CV.</p>
            <Button asChild>
              <Link href="/job-recommendations">View Recommendations</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Career Path Visualizer</CardTitle>
            <CardDescription>Explore career progression paths</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Discover career opportunities and progression paths in South African industries.</p>
            <Button asChild>
              <Link href="/career-path-visualizer">Explore Careers</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Interview Practice</CardTitle>
            <CardDescription>Practice with AI-powered interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Improve your interview skills with personalized practice sessions.</p>
            <Button asChild>
              <Link href="/interview-practice">Start Practice</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Skill Gap Analysis</CardTitle>
            <CardDescription>Identify areas for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Analyze your skills against target roles and get development recommendations.</p>
            <Button asChild>
              <Link href="/skill-gap-analysis">Analyze Skills</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Update your personal information and preferences.</p>
            <Button asChild>
              <Link href="/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}