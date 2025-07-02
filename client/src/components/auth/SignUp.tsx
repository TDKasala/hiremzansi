import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocation } from 'wouter';
import { TrendingUp, Eye, EyeOff, Shield, Users, Award, CheckCircle, Sparkles, Target, Zap } from 'lucide-react';

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'job_seeker' | 'employer' | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [, setLocation] = useLocation();
  
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password || !name || !userType) {
      setError('All fields are required, including account type');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    try {
      setLoading(true);
      const userData = {
        full_name: name,
        avatar_url: null
      };
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          username: email.split('@')[0],
          userType
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }
      
      setSuccess(true);
      // Do not redirect to dashboard - user needs to verify email first
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 backdrop-blur-sm">
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-yellow-800" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Account Created Successfully!</h2>
            <p className="text-gray-600 mb-4 text-lg">
              Please verify your email to complete registration
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 text-sm font-medium mb-2">Email Verification Required</p>
              <p className="text-amber-700 text-sm mb-3">
                We've sent a verification link to <strong>{email}</strong>. Check your inbox and spam folder, then click the verification link to activate your account.
              </p>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/auth/resend-verification', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email })
                    });
                    if (response.ok) {
                      setError('Verification email resent successfully!');
                      setTimeout(() => setError(null), 3000);
                    }
                  } catch (err) {
                    setError('Failed to resend verification email');
                  }
                }}
                className="text-amber-600 hover:text-amber-800 text-sm font-medium underline"
              >
                Resend verification email
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">What's next?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span>Upload your CV for instant analysis</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span>Get personalized optimization tips</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span>Access premium templates</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-primary">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <span className="font-medium">Preparing your dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex">
      {/* Left Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900">Hire Mzansi</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Get started with your free CV analysis</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Thabo Mthembu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                />
              </div>

              {/* User Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  I am a...
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      userType === 'job_seeker'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setUserType('job_seeker')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        userType === 'job_seeker'
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">Job Seeker</div>
                        <div className="text-sm text-gray-600">Looking for job opportunities and CV optimization</div>
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      userType === 'employer'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setUserType('employer')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        userType === 'employer'
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">Employer/Recruiter</div>
                        <div className="text-sm text-gray-600">Looking to hire candidates and post job listings</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
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
                  className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="h-12 pr-12 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="h-12 pr-12 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input 
                  type="checkbox" 
                  required
                  className="mt-1 rounded border-gray-300 text-primary focus:ring-primary/20" 
                />
                <p className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <a href="/terms" className="text-primary hover:underline font-medium">Terms of Service</a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</a>
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Your Free Account'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500 bg-white">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Footer Links */}
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 hover:underline font-semibold transition-colors"
                  onClick={() => setLocation('/login')}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-4 text-gray-500 text-sm">
              <span className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Secure
              </span>
              <span>•</span>
              <span>Free to start</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSI3IiBjeT0iNyIgcj0iNyIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold">Hire Mzansi</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Professional CV Optimization
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              AI-powered tools designed for the South African job market.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">ATS Optimization</h3>
                <p className="text-white/80 text-sm">Beat applicant tracking systems</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Instant Analysis</h3>
                <p className="text-white/80 text-sm">Get feedback in seconds</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">SA-Specific</h3>
                <p className="text-white/80 text-sm">B-BBEE and local market insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}