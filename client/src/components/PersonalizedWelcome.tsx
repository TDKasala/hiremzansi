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
      <section className="py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-20 -right-4 w-96 h-96 bg-purple-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-green-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-white/90 backdrop-blur-md hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
            <CardContent className="p-8 relative">
              {/* Decorative gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-lg opacity-20 blur-sm"></div>
              <div className="absolute inset-[1px] bg-white rounded-lg"></div>
              
              <div className="relative z-10 text-center space-y-8">
                {/* Enhanced greeting with typing animation */}
                <div className="space-y-4">
                  <div className="relative">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 animate-fade-in-up">
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                        {getTimeGreeting()}, welcome to Hire Mzansi!
                      </span>
                      <span className="inline-block animate-wave ml-2">👋</span>
                    </h1>
                    {/* Animated underline */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-expand-width"></div>
                  </div>
                  
                  <p className="text-lg sm:text-xl text-gray-600 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <span className="font-medium text-gray-800">{formatDate(currentTime)}</span>
                    <span className="mx-2 text-purple-500">•</span>
                    <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent font-semibold">
                      Transform your career with AI-powered CV optimization
                    </span>
                  </p>
                </div>

                {/* Enhanced feature cards with staggered animations */}
                <div className="grid md:grid-cols-3 gap-6 my-12">
                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-6 text-center">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700"></div>
                        <FileText className="h-10 w-10 text-blue-600 mx-auto relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-700 transition-colors duration-300">Upload Your CV</h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Get instant ATS analysis with AI insights</p>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-6 text-center">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700"></div>
                        <TrendingUp className="h-10 w-10 text-green-600 mx-auto relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-green-700 transition-colors duration-300">Get Insights</h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">South African context analysis & B-BBEE compliance</p>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-6 text-center">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-purple-500/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700"></div>
                        <Target className="h-10 w-10 text-purple-600 mx-auto relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-purple-700 transition-colors duration-300">Land Jobs</h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Optimize for success in SA job market</p>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced action buttons with premium effects */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '1s' }}>
                  <Link href="/signup" className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Button size="lg" className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group px-8 py-3">
                      <span className="relative z-10 flex items-center">
                        Get Started Free
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-white/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                    </Button>
                  </Link>
                  
                  <Link href="/login" className="group relative">
                    <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-purple-500 bg-white/50 backdrop-blur-sm hover:bg-purple-50 text-gray-700 hover:text-purple-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 px-8 py-3">
                      <span className="relative z-10 flex items-center">
                        Sign In
                        <div className="ml-2 w-2 h-2 bg-purple-500 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                      </span>
                    </Button>
                  </Link>
                </div>

                {/* Trust indicators with floating animation */}
                <div className="flex justify-center items-center space-x-8 pt-6 text-sm text-gray-500 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
                  <div className="flex items-center space-x-2 animate-float">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>AI-Powered</span>
                  </div>
                  <div className="flex items-center space-x-2 animate-float" style={{ animationDelay: '0.5s' }}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>ATS-Optimized</span>
                  </div>
                  <div className="flex items-center space-x-2 animate-float" style={{ animationDelay: '1s' }}>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>SA-Focused</span>
                  </div>
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