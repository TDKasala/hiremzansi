import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePlanFeatures } from '@/hooks/use-plan-features';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileUp, FileText, BarChart3, Search, Upload, Sparkles, BookOpen, User, Clock, Unlock } from 'lucide-react';
import { Link } from 'wouter';
import FeatureGate, { FeatureMessage } from '@/components/FeatureGate';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const { features, getPlanDisplayName, getScansRemaining, hasUnlimitedScans } = usePlanFeatures();
  
  // Redirect to auth if not logged in
  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to access your dashboard.</p>
          <Link href="/auth">
            <Button>Sign In / Register</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-4">Welcome back, {user.username}</h1>
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            {getPlanDisplayName()} Plan
          </Badge>
          
          {!hasUnlimitedScans() && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
              <FileText className="h-3.5 w-3.5 mr-1" />
              {getScansRemaining()} CV Scans Left
            </Badge>
          )}
          
          {hasUnlimitedScans() && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
              <Unlock className="h-3.5 w-3.5 mr-1" />
              Unlimited CV Scans
            </Badge>
          )}
        </div>
      </motion.div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-blue-500" />
                CV Upload & Analysis
              </CardTitle>
              <CardDescription>Upload your CV for ATS analysis</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="text-sm text-gray-600 mb-4">
                Upload your CV to get an ATS compatibility score and recommendations for improvement.
              </p>
              <div className="mt-auto">
                <Link href="/analyzer">
                  <Button className="w-full">Upload CV</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-500" />
                CV Improvement Tracking
              </CardTitle>
              <CardDescription>
                Track CV improvements over time
                <FeatureMessage feature="beforeAfterComparison" className="ml-2" />
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="text-sm text-gray-600 mb-4">
                View your CV's progress and improvements over time with before/after comparisons.
              </p>
              <div className="mt-auto">
                <FeatureGate feature="beforeAfterComparison">
                  <Link href="/cv-improvement">
                    <Button className="w-full">View Progress</Button>
                  </Link>
                </FeatureGate>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-green-500" />
                Job Matching
              </CardTitle>
              <CardDescription>
                Find matching jobs for your CV
                <FeatureMessage feature="jobMatching" className="ml-2" />
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="text-sm text-gray-600 mb-4">
                Get matched with relevant South African job opportunities based on your CV and skills.
              </p>
              <div className="mt-auto">
                <FeatureGate 
                  feature="jobMatching"
                  fallback={
                    <Link href="/pricing">
                      <Button variant="outline" className="w-full">Upgrade to Premium</Button>
                    </Link>
                  }
                >
                  <Link href="/job-matching">
                    <Button className="w-full">Find Matching Jobs</Button>
                  </Link>
                </FeatureGate>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Premium Tools</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                Interview Practice
              </CardTitle>
              <CardDescription>
                AI-powered interview simulation
                <FeatureMessage feature="interviewPractice" className="ml-2" />
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="text-sm text-gray-600 mb-4">
                Practice interviews with our AI system. Get feedback and improve your responses.
              </p>
              <div className="mt-auto">
                <FeatureGate feature="interviewPractice">
                  <Link href="/interview-practice">
                    <Button className="w-full">Start Practice</Button>
                  </Link>
                </FeatureGate>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-teal-500" />
                Skill Gap Analysis
              </CardTitle>
              <CardDescription>
                Analyze career path and skills
                <FeatureMessage feature="skillGapAnalysis" className="ml-2" />
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="text-sm text-gray-600 mb-4">
                Identify skill gaps between your CV and dream jobs. Get personalized learning recommendations.
              </p>
              <div className="mt-auto">
                <FeatureGate feature="skillGapAnalysis">
                  <Link href="/skill-analysis">
                    <Button className="w-full">Analyze Skills</Button>
                  </Link>
                </FeatureGate>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-red-500" />
                CV Bulk Upload
              </CardTitle>
              <CardDescription>
                Upload multiple CV versions
                <FeatureMessage feature="unlimitedUploads" className="ml-2" />
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="text-sm text-gray-600 mb-4">
                Upload multiple CV versions to compare scores and track improvement over time.
              </p>
              <div className="mt-auto">
                <FeatureGate feature="unlimitedUploads">
                  <Link href="/cv-manager">
                    <Button className="w-full">Manage CVs</Button>
                  </Link>
                </FeatureGate>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Your Plan Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">Available Features</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full mr-2 ${features.fullRecommendations ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Full ATS Recommendations
              </li>
              <li className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full mr-2 ${features.keywordOptimization ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Keyword Optimization
              </li>
              <li className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full mr-2 ${features.beforeAfterComparison ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Before/After Comparison
              </li>
              <li className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full mr-2 ${features.unlimitedUploads ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Unlimited CV Uploads
              </li>
              <li className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full mr-2 ${features.bbbeeGuidance ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                B-BBEE Guidance
              </li>
              <li className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full mr-2 ${features.nqfGuidance ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                NQF Level Guidance
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3">Premium Features</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full mr-2 ${features.interviewPractice ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Interview Practice
              </li>
              <li className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full mr-2 ${features.skillGapAnalysis ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Skill Gap Analysis
              </li>
              <li className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full mr-2 ${features.jobMatching ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Job Matching
              </li>
              <li className="flex items-center text-sm">
                <div className={`w-4 h-4 rounded-full mr-2 ${features.emailSupport ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Email Support
              </li>
            </ul>
          </div>
        </div>
        
        {!hasUnlimitedScans() && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">CV Scans Available</h3>
              <span className="text-sm text-gray-600">{getScansRemaining()} / {features.scanLimit}</span>
            </div>
            <Progress 
              value={(getScansRemaining() || 0) / (features.scanLimit || 1) * 100} 
              className="h-2"
            />
            
            {(getScansRemaining() || 0) < 2 && (
              <div className="mt-4 flex justify-end">
                <Link href="/pricing">
                  <Button variant="outline" size="sm">
                    Upgrade for More Scans
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Link href="/pricing">
            <Button variant="outline">View All Plan Options</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;