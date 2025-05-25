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
              <Link href="/job-matches">View Matches</Link>
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