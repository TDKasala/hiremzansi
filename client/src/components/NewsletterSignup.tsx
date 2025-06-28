import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface NewsletterSignupProps {
  variant?: 'default' | 'footer' | 'modal';
  className?: string;
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ 
  variant = 'default', 
  className = '' 
}) => {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const newsletterMutation = useMutation({
    mutationFn: async (emailData: { email: string }) => {
      return await apiRequest('/api/newsletter/subscribe', 'POST', emailData);
    },
    onSuccess: () => {
      setIsSuccess(true);
      setEmail('');
      toast({
        title: "Welcome to Hire Mzansi!",
        description: "You've successfully subscribed to our career insights newsletter.",
        variant: "default",
      });
      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    newsletterMutation.mutate({ email: email.trim() });
  };

  const isLoading = newsletterMutation.isPending;

  // Footer variant - compact horizontal layout
  if (variant === 'footer') {
    return (
      <div className={`${className}`}>
        <h4 className="text-lg font-semibold text-white mb-2">Stay Updated</h4>
        <p className="text-gray-300 text-sm mb-4">
          Get South African career insights and job market updates
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || isSuccess}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
          <Button
            type="submit"
            disabled={isLoading || isSuccess}
            className="bg-green-600 hover:bg-green-700 text-white px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              "Subscribe"
            )}
          </Button>
        </form>
      </div>
    );
  }

  // Modal variant - centered with description
  if (variant === 'modal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-lg p-6 max-w-md w-full ${className}`}
      >
        <div className="text-center mb-4">
          <Mail className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-gray-900">
            Join Our Career Newsletter
          </h3>
          <p className="text-gray-600 mt-2">
            Get exclusive South African job market insights, CV tips, and career opportunities delivered to your inbox.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || isSuccess}
            className="w-full"
          />
          <Button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Subscribed!
              </>
            ) : (
              "Subscribe to Newsletter"
            )}
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </motion.div>
    );
  }

  // Default variant - section with full styling
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`py-16 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 ${className}`}
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Stay Ahead in Your Career
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of South African professionals getting weekly insights on job market trends, 
          CV optimization tips, and exclusive career opportunities.
        </p>
        
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isSuccess}
              className="flex-1 h-12 text-base"
            />
            <Button
              type="submit"
              disabled={isLoading || isSuccess}
              className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isSuccess ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                "Subscribe"
              )}
            </Button>
          </form>
          
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm"
            >
              ✓ Welcome! Check your email to confirm your subscription.
            </motion.div>
          )}
          
          <p className="text-sm text-gray-500 mt-4">
            No spam, ever. Unsubscribe with one click.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Market Insights</h3>
            <p className="text-sm text-gray-600">
              Weekly South African job market trends and salary reports
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold">📝</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">CV Tips</h3>
            <p className="text-sm text-gray-600">
              Expert advice on optimizing your CV for South African employers
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Job Opportunities</h3>
            <p className="text-sm text-gray-600">
              Exclusive access to premium job postings and career opportunities
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default NewsletterSignup;