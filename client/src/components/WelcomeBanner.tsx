import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, Upload, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

interface WelcomeBannerProps {
  userName?: string;
  emailVerified?: boolean;
  onDismiss?: () => void;
}

export function WelcomeBanner({ userName, emailVerified = false, onDismiss }: WelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Check if user has dismissed welcome banner before
  useEffect(() => {
    const isDismissed = localStorage.getItem('welcome-banner-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('welcome-banner-dismissed', 'true');
    if (onDismiss) onDismiss();
  };

  if (dismissed) return null;

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200/30 to-pink-200/30 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-green-200/30 rounded-full translate-y-12 -translate-x-12"></div>
      
      <CardContent className="p-6 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-white/50"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                Welcome to Hire Mzansi, {userName || 'there'}!
              </h3>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                New User
              </Badge>
            </div>
            
            <p className="text-gray-600 mb-4">
              You're now part of South Africa's premier career advancement platform. Let's get your journey started!
            </p>

            {!emailVerified && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-800 text-sm font-medium">
                    Email verification sent! Check your inbox to verify your account.
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Upload Your CV</div>
                  <div className="text-xs text-gray-500">Get instant ATS score</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Optimize Content</div>
                  <div className="text-xs text-gray-500">AI-powered improvements</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Get Job Matches</div>
                  <div className="text-xs text-gray-500">South African market</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                <Link href="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload My First CV
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/how-it-works">
                  Learn How It Works
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}