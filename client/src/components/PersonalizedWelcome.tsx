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
  const [liveTime, setLiveTime] = useState(new Date());
  
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

  // Update live time every second
  useEffect(() => {
    const liveTimer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(liveTimer);
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

  const formatLiveTime = (date: Date) => {
    return date.toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Unauthenticated welcome screen
  if (!isAuthenticated) {
    return (
      <section className="min-h-screen flex items-center justify-center py-6 xs:py-8 sm:py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-48 xs:w-56 sm:w-64 md:w-72 h-48 xs:h-56 sm:h-64 md:h-72 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-20 -right-4 w-56 xs:w-64 sm:w-72 md:w-80 lg:w-96 h-56 xs:h-64 sm:h-72 md:h-80 lg:h-96 bg-purple-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-8 left-1/3 w-52 xs:w-60 sm:w-68 md:w-80 h-52 xs:h-60 sm:h-68 md:h-80 bg-green-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative w-full">
          <Card className="max-w-6xl mx-auto border-0 shadow-2xl bg-white/90 backdrop-blur-md hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
            <CardContent className="p-4 xs:p-6 sm:p-8 md:p-10 lg:p-12 relative">
              {/* Decorative gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-lg opacity-20 blur-sm"></div>
              <div className="absolute inset-[1px] bg-white rounded-lg"></div>
              
              <div className="relative z-10 text-center space-y-8">
                {/* Enhanced greeting with typing animation */}
                <div className="space-y-4">
                  <div className="relative px-2 xs:px-4 sm:px-6">
                    <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl 3xl:text-8xl font-bold text-gray-900 animate-fade-in-up leading-tight">
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                        {getTimeGreeting()}, welcome to Hire Mzansi!
                      </span>
                      <span className="inline-block animate-wave ml-1 xs:ml-2">👋</span>
                    </h1>
                    {/* Animated underline */}
                    <div className="absolute -bottom-1 xs:-bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 xs:h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-expand-width"></div>
                  </div>
                  
                  {/* Enhanced status bar with glassmorphism design */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white/80 via-white/90 to-white/80 backdrop-blur-xl border border-white/20 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 animate-pulse"></div>
                    
                    {/* Floating orbs */}
                    <div className="absolute top-2 right-4 w-3 h-3 bg-blue-400/40 rounded-full animate-bounce"></div>
                    <div className="absolute bottom-2 left-6 w-2 h-2 bg-purple-400/40 rounded-full animate-ping animation-delay-500"></div>
                    <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-green-400/40 rounded-full animate-pulse animation-delay-1000"></div>
                    
                    <div className="relative z-10 p-2 xs:p-3 sm:p-4 md:p-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-6">
                      {/* Date and Time Section */}
                      <div className="flex flex-col xs:flex-row items-center justify-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm rounded-xl px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 border border-gray-200/50 shadow-sm">
                          <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="font-semibold text-gray-800 text-xs xs:text-sm sm:text-base whitespace-nowrap">{formatDate(currentTime)}</span>
                        </div>
                        
                        <div className="hidden sm:block w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                        
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                          <div className="relative bg-gradient-to-r from-blue-50/90 to-indigo-50/90 backdrop-blur-sm rounded-xl px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 border border-blue-200/50 shadow-sm group-hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
                              <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="font-mono text-blue-700 font-bold text-xs xs:text-sm sm:text-base">{formatLiveTime(liveTime)}</span>
                              <div className="text-xs text-blue-600/70 hidden xs:inline">LIVE</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom glow effect */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
                  </div>
                </div>

                {/* Enhanced feature cards with staggered animations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 my-8 sm:my-12">
                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-4 sm:p-6 text-center">
                      <div className="relative mb-3 sm:mb-4">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700"></div>
                        <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mx-auto relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg group-hover:text-blue-700 transition-colors duration-300">Upload Your CV</h3>
                      <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">Get instant ATS analysis with AI insights</p>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-4 sm:p-6 text-center">
                      <div className="relative mb-3 sm:mb-4">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700"></div>
                        <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 mx-auto relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg group-hover:text-green-700 transition-colors duration-300">Get Insights</h3>
                      <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">South African context analysis & B-BBEE compliance</p>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl animate-fade-in-up sm:col-span-2 lg:col-span-1" style={{ animationDelay: '0.8s' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-4 sm:p-6 text-center">
                      <div className="relative mb-3 sm:mb-4">
                        <div className="absolute inset-0 bg-purple-500/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700"></div>
                        <Target className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 mx-auto relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg group-hover:text-purple-700 transition-colors duration-300">Land Jobs</h3>
                      <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">Optimize for success in SA job market</p>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced action buttons with premium effects */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in-up w-full" style={{ animationDelay: '1s' }}>
                  <Link href="/signup" className="group relative w-full sm:w-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Button size="lg" className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group px-6 sm:px-8 py-3 w-full sm:w-auto text-sm sm:text-base">
                      <span className="relative z-10 flex items-center justify-center">
                        Get Started Free
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-white/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                    </Button>
                  </Link>
                  
                  <Link href="/login" className="group relative w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-purple-500 bg-white/50 backdrop-blur-sm hover:bg-purple-50 text-gray-700 hover:text-purple-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 px-6 sm:px-8 py-3 w-full sm:w-auto text-sm sm:text-base">
                      <span className="relative z-10 flex items-center justify-center">
                        Sign In
                        <div className="ml-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                      </span>
                    </Button>
                  </Link>
                </div>

                {/* Trust indicators with floating animation */}
                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 pt-4 sm:pt-6 text-xs sm:text-sm text-gray-500 animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
                  <div className="flex items-center gap-1.5 sm:gap-2 animate-float">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="whitespace-nowrap">AI-Powered</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 animate-float" style={{ animationDelay: '0.5s' }}>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="whitespace-nowrap">ATS-Optimized</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 animate-float" style={{ animationDelay: '1s' }}>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="whitespace-nowrap">SA-Focused</span>
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
    <section className="min-h-screen flex items-center justify-center py-4 xs:py-6 sm:py-8 lg:py-12 bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto w-full">
          {/* Main Welcome Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-4 xs:mb-6 sm:mb-8">
            <CardContent className="p-3 xs:p-4 sm:p-6 md:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Personalized Greeting */}
                <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 break-words leading-tight">
                      {getTimeGreeting()}, {getUserName()}! 🌟
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 text-sm sm:text-base lg:text-lg text-gray-600">
                      <span>{formatDate(currentTime)}</span>
                      <span className="hidden sm:inline mx-2">•</span>
                      <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs sm:text-sm">{formatLiveTime(liveTime)}</span>
                      <span className="hidden sm:inline mx-2">•</span>
                      <span className="text-sm sm:text-base">Ready to boost your career today?</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                    {latestCV && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs sm:text-sm">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        CV Uploaded
                      </Badge>
                    )}
                    {userStats && userStats.totalAnalyses > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {userStats.totalAnalyses} Analyses
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs sm:text-sm">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Member since </span>
                      <span className="sm:hidden">Since </span>
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }) : 'Recently'}
                    </Badge>
                  </div>

                  {/* Personalized Message */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500">
                    {!latestCV ? (
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        🚀 <strong>Let's get started!</strong> Upload your CV to receive personalized optimization recommendations and boost your job prospects.
                      </p>
                    ) : userStats?.lastAnalysisDate && new Date(userStats.lastAnalysisDate) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? (
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        📈 <strong>Time for an update!</strong> It's been a while since your last analysis. Check your CV for new optimization opportunities.
                      </p>
                    ) : (
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        ✨ <strong>Looking great!</strong> Your CV is optimized and ready. Explore our premium tools to take your career to the next level.
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile Summary */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Your Profile
                    </h3>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                        <span className="text-gray-600 font-medium sm:font-normal">Email:</span>
                        <span className="font-medium break-all sm:text-right">{user?.email}</span>
                      </div>
                      {user?.firstName && (
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                          <span className="text-gray-600 font-medium sm:font-normal">Name:</span>
                          <span className="font-medium sm:text-right">{user.firstName} {user.lastName}</span>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                        <span className="text-gray-600 font-medium sm:font-normal">Status:</span>
                        <Badge variant="outline" className="text-xs w-fit">
                          {user?.isEmailVerified ? 'Verified' : 'Pending Verification'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Quick Actions</h3>
                    <div className="space-y-2">
                      <Link href="/upload" className="block">
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9">
                          <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          {latestCV ? 'Re-analyze CV' : 'Upload CV'}
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-auto" />
                        </Button>
                      </Link>
                      <Link href="/tools/ats-keywords" className="block">
                        <Button variant="outline" size="sm" className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9">
                          <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          ATS Keywords Tool
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-auto" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Recent CV Analysis */}
            {latestCV && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                    Your Latest CV
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                      <span className="text-gray-600 text-xs sm:text-sm font-medium sm:font-normal">File:</span>
                      <span className="font-medium text-xs sm:text-sm break-all sm:text-right">{latestCV.fileName}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                      <span className="text-gray-600 text-xs sm:text-sm font-medium sm:font-normal">Uploaded:</span>
                      <span className="font-medium text-xs sm:text-sm sm:text-right">
                        {new Date(latestCV.createdAt).toLocaleDateString('en-ZA')}
                      </span>
                    </div>
                    {latestCV.analysis && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                        <span className="text-gray-600 text-xs sm:text-sm font-medium sm:font-normal">Score:</span>
                        <Badge className="bg-green-100 text-green-800 text-xs w-fit">
                          {latestCV.analysis.overallScore || 'N/A'}/100
                        </Badge>
                      </div>
                    )}
                    <Link href={`/cv/${latestCV.id}`} className="block">
                      <Button size="sm" variant="outline" className="w-full mt-2 sm:mt-3 text-xs sm:text-sm h-8 sm:h-9">
                        View Analysis
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
                  Recommendations
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {!latestCV ? (
                    <div className="p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs sm:text-sm text-blue-800 mb-1 sm:mb-2 font-medium">
                        Start with CV Analysis
                      </p>
                      <p className="text-xs text-blue-600 leading-relaxed">
                        Upload your CV to get personalized optimization tips
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs sm:text-sm text-green-800 mb-1 sm:mb-2 font-medium">
                          Try ATS Keywords
                        </p>
                        <p className="text-xs text-green-600 leading-relaxed">
                          Optimize your CV for specific job descriptions
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs sm:text-sm text-purple-800 mb-1 sm:mb-2 font-medium">
                          Practice Interviews
                        </p>
                        <p className="text-xs text-purple-600 leading-relaxed">
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