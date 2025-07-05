import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocation } from 'wouter';
import { TrendingUp, Eye, EyeOff, Shield, Target, Zap, Award, Sparkles } from 'lucide-react';

export function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'job_seeker' | 'employer'>('job_seeker');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      
      // Use AuthContext signUp method for proper state management
      const result = await signUp(email, password, { name, userType });
      
      if (result.error) {
        throw result.error;
      }
      
      // Redirect based on user type
      if (userType === 'employer') {
        setLocation('/recruiter/dashboard');
      } else {
        setLocation('/dashboard');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white flex relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-400/10 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-20 w-32 h-32 bg-blue-400/10 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-300/10 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute top-20 right-1/3 w-16 h-16 bg-blue-300/10 rounded-full animate-float animation-delay-3000"></div>
      </div>

      {/* Left Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-4 relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur-lg opacity-30"></div>
                <div className="relative w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Hire Mzansi
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
            </div>
            <p className="text-gray-600">Join thousands optimizing their careers with AI</p>
          </div>

          {/* Form Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-blue-100/50 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 ring-1 ring-gray-200/50">
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
                    className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
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
                          ? 'border-green-500 bg-green-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setUserType('job_seeker')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          userType === 'job_seeker'
                            ? 'border-green-500 bg-green-500'
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
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setUserType('employer')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          userType === 'employer'
                            ? 'border-blue-500 bg-blue-500'
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
                    className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
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
                      className="h-12 pr-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
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
                      className="h-12 pr-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
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
                    className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500/20" 
                  />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <a href="/terms" className="text-green-600 hover:underline font-medium">Terms of Service</a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-green-600 hover:underline font-medium">Privacy Policy</a>
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
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
                    className="text-green-600 hover:text-green-700 hover:underline font-semibold transition-colors"
                    onClick={() => setLocation('/login')}
                  >
                    Sign in
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
              <span>Free to start</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 via-blue-500 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSI3IiBjeT0iNyIgcj0iNyIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        {/* Floating Animation Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-4 h-4 bg-white/30 rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-white/20 rounded-full animate-float animation-delay-1000"></div>
          <div className="absolute bottom-32 left-20 w-3 h-3 bg-white/40 rounded-full animate-float animation-delay-2000"></div>
          <div className="absolute bottom-20 right-32 w-5 h-5 bg-white/25 rounded-full animate-float animation-delay-3000"></div>
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
              Transform Your Career with AI-Powered CV Analysis
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed drop-shadow-sm">
              Join thousands of South Africans who've optimized their CVs for B-BBEE compliance and ATS success.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center ring-1 ring-white/30">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">ATS Optimization</h3>
                <p className="text-white/80 text-sm">Beat applicant tracking systems with smart keyword optimization</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center ring-1 ring-white/30">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Instant AI Analysis</h3>
                <p className="text-white/80 text-sm">Get comprehensive CV feedback in under 30 seconds</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center ring-1 ring-white/30">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">South African Focus</h3>
                <p className="text-white/80 text-sm">B-BBEE compliance, NQF levels, and local market insights</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm text-white/80">CVs Optimized</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">95%</div>
              <div className="text-sm text-white/80">Success Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-white/80">Companies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}