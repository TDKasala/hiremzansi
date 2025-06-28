import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  FileText,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Zap,
  Target,
  Calendar,
  Award,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface UserStats {
  totalAnalyses: number;
  lastAnalysisDate: string | null;
  latestScore: number | null;
  hasSubscription: boolean;
  subscriptionStatus: string | null;
  memberSince: string;
}

interface CVData {
  id: number;
  fileName: string;
  createdAt: string;
  analysis?: {
    overallScore: number;
  };
}

interface PersonalizedWelcomeProps {
  user?: any;
  isAuthenticated: boolean;
}

export function PersonalizedWelcome({ user, isAuthenticated }: PersonalizedWelcomeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Get user's latest CV data
  const { data: latestCV } = useQuery<CVData>({
    queryKey: ['/api/latest-cv'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Get user's recent activity
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserName = () => {
    if (!user) return 'there';
    return user.firstName || user.username || user.email?.split('@')[0] || 'there';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Unauthenticated welcome screen
  if (!isAuthenticated) {
    return (
      <section className="py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {getTimeGreeting()}, welcome to Hire Mzansi! 👋
                  </h1>
                  <p className="text-lg text-gray-600">
                    {formatDate(currentTime)} • Transform your career with AI-powered CV optimization
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 my-8">
                  <div className="group p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-300">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold text-gray-900 mb-1">Upload Your CV</h3>
                    <p className="text-sm text-gray-600">Get instant ATS analysis</p>
                  </div>
                  <div className="group p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-300">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold text-gray-900 mb-1">Get Insights</h3>
                    <p className="text-sm text-gray-600">South African context analysis</p>
                  </div>
                  <div className="group p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors duration-300">
                    <Target className="h-8 w-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold text-gray-900 mb-1">Land Jobs</h3>
                    <p className="text-sm text-gray-600">Optimize for success</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 group">
                      Get Started Free
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Authenticated personalized welcome screen
  return (
    <section className="py-12 bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main Welcome Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Personalized Greeting */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                      {getTimeGreeting()}, {getUserName()}! 🌟
                    </h1>
                    <p className="text-lg text-gray-600">
                      {formatDate(currentTime)} • Ready to boost your career today?
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4">
                    {latestCV && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <FileText className="h-4 w-4 mr-1" />
                        CV Uploaded
                      </Badge>
                    )}
                    {userStats && userStats.totalAnalyses > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {userStats.totalAnalyses} Analyses
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <Clock className="h-4 w-4 mr-1" />
                      Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }) : 'Recently'}
                    </Badge>
                  </div>

                  {/* Personalized Message */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border-l-4 border-blue-500">
                    {!latestCV ? (
                      <p className="text-gray-700">
                        🚀 <strong>Let's get started!</strong> Upload your CV to receive personalized optimization recommendations and boost your job prospects.
                      </p>
                    ) : userStats?.lastAnalysisDate && new Date(userStats.lastAnalysisDate) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? (
                      <p className="text-gray-700">
                        📈 <strong>Time for an update!</strong> It's been a while since your last analysis. Check your CV for new optimization opportunities.
                      </p>
                    ) : (
                      <p className="text-gray-700">
                        ✨ <strong>Looking great!</strong> Your CV is optimized and ready. Explore our premium tools to take your career to the next level.
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile Summary */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Your Profile
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{user?.email}</span>
                      </div>
                      {user?.firstName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{user.firstName} {user.lastName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant="outline" className="text-xs">
                          {user?.isEmailVerified ? 'Verified' : 'Pending Verification'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                    <div className="space-y-2">
                      <Link href="/upload">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Zap className="h-4 w-4 mr-2" />
                          {latestCV ? 'Re-analyze CV' : 'Upload CV'}
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                      </Link>
                      <Link href="/tools/ats-keywords">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Target className="h-4 w-4 mr-2" />
                          ATS Keywords Tool
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity & Recommendations */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent CV Analysis */}
            {latestCV && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Your Latest CV
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">File:</span>
                      <span className="font-medium text-sm">{latestCV.fileName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Uploaded:</span>
                      <span className="font-medium text-sm">
                        {new Date(latestCV.createdAt).toLocaleDateString('en-ZA')}
                      </span>
                    </div>
                    {latestCV.analysis && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Score:</span>
                        <Badge className="bg-green-100 text-green-800">
                          {latestCV.analysis.overallScore || 'N/A'}/100
                        </Badge>
                      </div>
                    )}
                    <Link href={`/cv/${latestCV.id}`}>
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        View Analysis
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-purple-600" />
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {!latestCV ? (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Start with CV Analysis</strong>
                      </p>
                      <p className="text-xs text-blue-600">
                        Upload your CV to get personalized optimization tips
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800 mb-2">
                          <strong>Try ATS Keywords</strong>
                        </p>
                        <p className="text-xs text-green-600">
                          Optimize your CV for specific job descriptions
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-800 mb-2">
                          <strong>Practice Interviews</strong>
                        </p>
                        <p className="text-xs text-purple-600">
                          Prepare with AI-powered interview coaching
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}