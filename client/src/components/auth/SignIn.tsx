import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocation } from 'wouter';
import { TrendingUp, Eye, EyeOff, Shield, Users, Award } from 'lucide-react';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  
  const { signIn, checkAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Use AuthContext signIn method for proper state management
      const result = await signIn(email, password);
      
      if (result.error) {
        throw result.error;
      }
      
      // Wait for auth state to be properly updated, then redirect
      setTimeout(() => {
        setLocation('/dashboard');
      }, 200);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-white flex relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-24 h-24 bg-blue-400/10 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 left-20 w-20 h-20 bg-green-400/10 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute top-40 left-1/4 w-16 h-16 bg-blue-300/10 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-green-300/10 rounded-full animate-float animation-delay-3000"></div>
      </div>

      {/* Desktop Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-green-500 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSI3IiBjeT0iNyIgcj0iNyIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        {/* Floating Animation Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-24 left-16 w-3 h-3 bg-white/40 rounded-full animate-float"></div>
          <div className="absolute top-60 right-24 w-5 h-5 bg-white/25 rounded-full animate-float animation-delay-1000"></div>
          <div className="absolute bottom-40 left-24 w-4 h-4 bg-white/35 rounded-full animate-float animation-delay-2000"></div>
          <div className="absolute bottom-24 right-20 w-6 h-6 bg-white/20 rounded-full animate-float animation-delay-3000"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3 mb-6 relative">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg"></div>
                <div className="relative w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/30">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-white drop-shadow-lg">Hire Mzansi</span>
                <div className="text-sm text-white/80 font-medium">Professional CV Platform</div>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight drop-shadow-lg">
              Welcome Back to Your Career Journey
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed drop-shadow-sm">
              Continue optimizing your professional profile with our AI-powered tools designed for the South African job market.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center ring-1 ring-white/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">10,000+ Success Stories</h3>
                <p className="text-white/80 text-sm">Join professionals who've transformed their careers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center ring-1 ring-white/30">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">B-BBEE Compliance</h3>
                <p className="text-white/80 text-sm">Specialized insights for South African requirements</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center ring-1 ring-white/30">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Bank-Level Security</h3>
                <p className="text-white/80 text-sm">Your personal data protected with enterprise encryption</p>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm text-white/80">CVs Optimized</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">95%</div>
              <div className="text-sm text-white/80">Success Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-white/80">Companies</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile & Desktop Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen relative z-10">
        {/* Mobile Header with Logo */}
        <div className="lg:hidden bg-gradient-to-r from-blue-500 to-green-500 px-6 pt-12 pb-8 text-white">
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 mb-4 relative">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg"></div>
                <div className="relative w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold drop-shadow-lg">Hire Mzansi</span>
            </div>
            <h1 className="text-xl font-medium mb-2 drop-shadow-sm">Welcome back</h1>
            <p className="text-white/80 text-sm">Continue optimizing your career journey</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
              <div className="relative inline-block mb-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Welcome Back
                </h1>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full"></div>
              </div>
              <p className="text-gray-600">Continue your professional journey with AI-powered insights</p>
            </div>

            {/* Form Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-green-100/50 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 lg:p-8 ring-1 ring-gray-200/50">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Sign In Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
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
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
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
                        className="h-12 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 text-base"
                        placeholder="Enter your password"
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

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/20" />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                      onClick={() => setLocation('/forgot-password')}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 mt-6"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      'Sign In to Your Account'
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
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors"
                      onClick={() => setLocation('/signup')}
                    >
                      Sign up for free
                    </button>
                  </p>
                </div>
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
                <span>Trusted by 10K+ users</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}