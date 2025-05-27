import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocation } from 'wouter';
import { Briefcase, TrendingUp, Users, ChevronRight, Eye, EyeOff } from 'lucide-react';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }
      
      // Redirect to dashboard on successful login
      setLocation('/dashboard');
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex">
      {/* Left Side - Branding & Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-green-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        
        {/* Logo & Header */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ATSBoost</h1>
              <p className="text-blue-100">South Africa's #1 CV Optimization Platform</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Transform Your Career<br />
              <span className="text-yellow-300">in South Africa</span>
            </h2>
            <p className="text-xl text-blue-100">
              Get past ATS systems, land interviews, and secure your dream job with AI-powered CV optimization designed for the South African market.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-lg">85% higher interview rate with optimized CVs</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-lg">50,000+ South African professionals trust us</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-lg">B-BBEE & NQF compliant analysis</span>
          </div>
        </div>

        {/* Success Quote */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <p className="text-lg italic mb-3">
            "ATSBoost helped me land my dream job at a top JSE company in just 2 weeks. The B-BBEE optimization was game-changing!"
          </p>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              T
            </div>
            <div>
              <div className="font-semibold">Thabo M.</div>
              <div className="text-sm text-blue-200">Senior Analyst, Johannesburg</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-xl p-3">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ATSBoost</h1>
                <p className="text-sm text-gray-600">CV Optimization Platform</p>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue optimizing your career success</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="thabo@company.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="h-12 text-base"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={() => setLocation('/forgot-password')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="h-12 text-base pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-200 shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Sign In to ATSBoost</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              New to ATSBoost?{' '}
              <button
                onClick={() => setLocation('/signup')}
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
              >
                Create your free account
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Join thousands of South African professionals advancing their careers
            </p>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="text-center text-sm text-gray-600">
              <span className="font-semibold text-green-600">Free to get started</span> • No credit card required
            </div>
            <div className="flex justify-center space-x-6 text-xs text-gray-500">
              <span>✓ Instant CV Analysis</span>
              <span>✓ ATS Optimization</span>
              <span>✓ SA Market Insights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}