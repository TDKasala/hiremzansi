import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocation } from 'wouter';
import { Briefcase, TrendingUp, Users, ChevronRight, Eye, EyeOff, Check, Star, Award } from 'lucide-react';

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
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
    
    // Basic validation
    if (!email || !password || !name) {
      setError('All fields are required');
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
      // Add user metadata to be stored in Supabase
      const userData = {
        full_name: name,
        avatar_url: null
      };
      
      const { data, error } = await signUp(email, password, userData);
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex">
      {/* Left Side - Branding & Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-blue-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5"></div>
        </div>
        
        {/* Logo & Header */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ATSBoost</h1>
              <p className="text-green-100">Join South Africa's Leading Career Platform</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Launch Your Career<br />
              <span className="text-yellow-300">Success Story</span>
            </h2>
            <p className="text-xl text-green-100">
              Join thousands of South African professionals who've transformed their careers with AI-powered CV optimization and expert guidance.
            </p>
          </div>
        </div>

        {/* What You Get */}
        <div className="relative z-10 space-y-4">
          <h3 className="text-xl font-semibold mb-4">What you get for free:</h3>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Check className="h-5 w-5" />
            </div>
            <span className="text-lg">Instant AI-powered CV analysis</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Star className="h-5 w-5" />
            </div>
            <span className="text-lg">ATS optimization recommendations</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-lg">Industry-specific templates & guides</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-lg">Access to career development tools</span>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <p className="text-lg italic mb-3">
            "I got 3 interview requests within a week of optimizing my CV with ATSBoost. The B-BBEE insights were invaluable!"
          </p>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              S
            </div>
            <div>
              <div className="font-semibold">Sarah K.</div>
              <div className="text-sm text-green-200">Marketing Manager, Cape Town</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-xl p-3">
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
            <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
            <p className="text-gray-600">Start optimizing your career success today - completely free</p>
          </div>

          {/* Error/Success Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success ? (
            <div className="text-center space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Account created successfully!</strong><br />
                  Please check your email to verify your account and get started.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => setLocation('/login')}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  Go to Sign In
                </Button>
                <p className="text-sm text-gray-500">
                  Didn't receive the email? Check your spam folder or contact support.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Sign Up Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nomsa Mthembu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                    className="h-12 text-base"
                  />
                </div>
              
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nomsa@company.co.za"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="h-12 text-base"
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
                      className="h-12 text-base pr-12"
                      placeholder="At least 8 characters"
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
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
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
                      className="h-12 text-base pr-12"
                      placeholder="Repeat your password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating your account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Start Your Career Journey</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Terms & Privacy */}
              <div className="text-center text-xs text-gray-500 space-y-2">
                <p>
                  By creating an account, you agree to our{' '}
                  <button 
                    onClick={() => setLocation('/terms')}
                    className="text-blue-600 hover:underline"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button 
                    onClick={() => setLocation('/privacy')}
                    className="text-blue-600 hover:underline"
                  >
                    Privacy Policy
                  </button>
                </p>
              </div>

              {/* Sign In Link */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => setLocation('/login')}
                    className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>

              {/* Quick Benefits */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 space-y-3">
                <div className="text-center text-sm font-medium text-gray-700">
                  🚀 Get started immediately with:
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>Free CV analysis with ATS scoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>South African market-specific insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-3 w-3 text-green-600" />
                    <span>Industry templates and career tools</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}