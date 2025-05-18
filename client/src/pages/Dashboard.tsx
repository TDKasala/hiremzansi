import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart, Clock, CheckCircle, ArrowRight, Upload, FileUp } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Mock data for demonstration purposes
  const recentCVs = [
    { id: 1, name: "Marketing_CV_2025.pdf", date: "20 May 2025", score: 92 },
    { id: 2, name: "Technical_CV_2025.docx", date: "15 May 2025", score: 84 },
    { id: 3, name: "Financial_Analyst_CV.pdf", date: "10 May 2025", score: 78 }
  ];
  
  const jobMatches = [
    { id: 1, role: "Senior Marketing Manager", company: "ABC Corporation", location: "Cape Town", match: 94, status: "Applied", date: "22 May 2025" },
    { id: 2, role: "Digital Marketing Specialist", company: "XYZ Technologies", location: "Johannesburg", match: 92, status: "Saved", date: "21 May 2025" },
    { id: 3, role: "Brand Manager", company: "Global Brands SA", location: "Durban", match: 89, status: "Interview", date: "18 May 2025" },
    { id: 4, role: "Content Marketing Lead", company: "Innovative Digital", location: "Remote", match: 87, status: "Saved", date: "16 May 2025" }
  ];
  
  const usageStats = {
    cvUploads: { used: 3, limit: 10, percentage: 30 },
    jobMatches: { used: 15, limit: 50, percentage: 30 },
    atsScans: { used: 8, limit: 20, percentage: 40 }
  };
  
  const getScoreColor = (score: number) => {
    if (score < 60) return "text-red-500";
    if (score < 80) return "text-amber-500";
    return "text-green-500";
  };
  
  const getProgressColor = (score: number) => {
    if (score < 60) return "bg-red-500";
    if (score < 80) return "bg-amber-500";
    return "bg-green-500";
  };
  
  const getMatchBadgeColor = (status: string) => {
    if (status === "Applied") return "bg-blue-100 text-blue-800";
    if (status === "Interview") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.username || 'Guest'}!</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              <span>Import Job Description</span>
            </Button>
            <Button className="bg-amber-500 hover:bg-amber-600 flex items-center">
              <FileUp className="h-4 w-4 mr-2" />
              <span>Upload CV</span>
            </Button>
          </div>
        </div>
        
        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">CV Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{usageStats.cvUploads.used}</span>
                <span className="ml-1 text-gray-500">/ {usageStats.cvUploads.limit}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500 mb-2">Pro plan limit</div>
              <Progress value={usageStats.cvUploads.percentage} className="h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Job Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{usageStats.jobMatches.used}</span>
                <span className="ml-1 text-gray-500">/ {usageStats.jobMatches.limit}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500 mb-2">Pro plan limit</div>
              <Progress value={usageStats.jobMatches.percentage} className="h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">ATS Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{usageStats.atsScans.used}</span>
                <span className="ml-1 text-gray-500">/ {usageStats.atsScans.limit}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500 mb-2">Pro plan limit</div>
              <Progress value={usageStats.atsScans.percentage} className="h-2" />
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent CVs */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent CVs</CardTitle>
                  <CardDescription>Your recent CV uploads</CardDescription>
                </div>
                <Link href="/cv-improvement">
                  <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCVs.map((cv) => (
                  <div 
                    key={cv.id} 
                    className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-amber-200 hover:bg-amber-50 transition-colors cursor-pointer"
                  >
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">{cv.name}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{cv.date}</span>
                        <span className={`font-semibold ${getScoreColor(cv.score)}`}>
                          Score: {cv.score}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full mt-4">
                  <FileUp className="h-4 w-4 mr-2" />
                  <span>Upload New CV</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Job Matches / Content Area */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <Tabs defaultValue="matches">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <CardTitle>Job Matches</CardTitle>
                    <CardDescription>Jobs matching your CV profile</CardDescription>
                  </div>
                  <TabsList>
                    <TabsTrigger value="matches">Matches</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                    <TabsTrigger value="applied">Applied</TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobMatches.map((job) => (
                  <div 
                    key={job.id} 
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-0">
                      <div className="md:w-1/2">
                        <h3 className="font-semibold text-lg">{job.role}</h3>
                        <p className="text-gray-700">{job.company}</p>
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                          <span>{job.location}</span>
                          <span className="mx-2">•</span>
                          <span>{job.date}</span>
                        </div>
                      </div>
                      <div className="md:w-1/2 flex flex-col md:flex-row md:items-center md:justify-end gap-3">
                        <div className="flex items-center">
                          <div className="w-full md:w-auto">
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={job.match} 
                                className={`w-16 h-2 ${getProgressColor(job.match)}`} 
                              />
                              <span className={`font-semibold text-sm ${getScoreColor(job.match)}`}>
                                {job.match}% Match
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge className={getMatchBadgeColor(job.status)}>
                          {job.status}
                        </Badge>
                        <Button size="sm" className="md:ml-auto">
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-center mt-6">
                  <Button variant="outline">
                    <span>View More Jobs</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions Section */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Analyze CV</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Upload a new CV or analyze an existing one with our ATS scanner.
                  </p>
                  <Button variant="outline" size="sm" className="mt-auto">
                    <Link href="/analyzer">Start Analysis</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <BarChart className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Track Progress</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    View your CV improvement history and track your progress over time.
                  </p>
                  <Button variant="outline" size="sm" className="mt-auto">
                    <Link href="/cv-improvement">View Progress</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Match to Jobs</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Match your CV to job descriptions to find the best opportunities.
                  </p>
                  <Button variant="outline" size="sm" className="mt-auto">
                    <Link href="/job-matcher">Find Matches</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Prepare for Interviews</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Practice with our AI-powered interview simulator tailored for South African employers.
                  </p>
                  <Button variant="outline" size="sm" className="mt-auto">
                    <Link href="/interview-prep">Start Practice</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;