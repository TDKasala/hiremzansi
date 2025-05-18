import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';

// Define the form schema for signup
const signupSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions.',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Define the form schema for login
const loginSchema = z.object({
  username: z.string().min(1, {
    message: 'Please enter your username.',
  }),
  password: z.string().min(1, {
    message: 'Please enter your password.',
  }),
});

const AuthPage = () => {
  const [currentTab, setCurrentTab] = useState('login');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { loginMutation, registerMutation } = useAuth();

  // Create login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Create signup form
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  // Login form submission handler
  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values, {
      onSuccess: () => {
        toast({
          title: 'Login successful',
          description: 'Welcome back to ATSBoost!',
        });
        navigate('/');
      },
      onError: (error) => {
        toast({
          title: 'Login failed',
          description: error.message || 'Please check your credentials and try again.',
          variant: 'destructive',
        });
      }
    });
  }

  // Signup form submission handler
  function onSignupSubmit(values: z.infer<typeof signupSchema>) {
    const { confirmPassword, ...userData } = values;
    
    registerMutation.mutate(userData, {
      onSuccess: () => {
        toast({
          title: 'Registration successful',
          description: 'Your account has been created. Welcome to ATSBoost!',
        });
        navigate('/');
      },
      onError: (error) => {
        toast({
          title: 'Registration failed',
          description: error.message || 'Please try again with different credentials.',
          variant: 'destructive',
        });
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <div className="md:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Welcome to ATSBoost</CardTitle>
                <CardDescription className="text-center">
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  {/* Login Form */}
                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="pt-2">
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? 'Logging in...' : 'Login'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                      <span className="text-muted-foreground">Don't have an account?</span>{' '}
                      <Button 
                        variant="link" 
                        className="p-0" 
                        onClick={() => setCurrentTab('signup')}
                      >
                        Sign up now
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Signup Form */}
                  <TabsContent value="signup">
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                        <FormField
                          control={signupForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormDescription>
                                This will be your display name on ATSBoost.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Create a password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Must be at least 8 characters.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirm your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="terms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  I agree to the terms of service and privacy policy
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                        <div className="pt-2">
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                      <span className="text-muted-foreground">Already have an account?</span>{' '}
                      <Button 
                        variant="link" 
                        className="p-0" 
                        onClick={() => setCurrentTab('login')}
                      >
                        Log in
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <div className="md:w-1/2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full flex flex-col justify-center"
          >
            <div className="bg-amber-50 p-8 rounded-lg h-full flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-6">Boost Your Career in South Africa</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">ATS-Optimized CVs</h3>
                    <p className="text-gray-600">Create CVs that pass through applicant tracking systems with our advanced tools.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">South African Context</h3>
                    <p className="text-gray-600">Properly highlight B-BBEE status, NQF qualifications, and other South African specific elements.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Track Your Progress</h3>
                    <p className="text-gray-600">See improvements in your CV over time with our before/after comparison tools.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Expert Advice</h3>
                    <p className="text-gray-600">Access South African job market insights and career advice from industry experts.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-white p-4 rounded border border-amber-200">
                <div className="text-sm font-medium text-gray-500 mb-1">What our users are saying:</div>
                <p className="italic text-gray-700">
                  "ATSBoost helped me optimize my CV for the South African job market. I added my B-BBEE status as suggested, and started getting more interview calls immediately!"
                </p>
                <div className="mt-2 font-medium">— Thabo M., Software Developer</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;