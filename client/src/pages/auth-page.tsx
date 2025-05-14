import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Forgot password schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

// Registration form schema
const registerSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const { toast } = useToast();
  
  // Create form for login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    },
  });
  
  // Create form for registration
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      name: ""
    },
  });
  
  // Handle login form submission
  function onLoginSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }
  
  // Handle registration form submission
  function onRegisterSubmit(values: RegisterFormValues) {
    registerMutation.mutate(values);
  }
  
  // Create form for forgot password
  const forgotPasswordForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    },
  });
  
  // Handle forgot password form submission
  async function onForgotPasswordSubmit(values: ForgotPasswordValues) {
    setIsSubmittingReset(true);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reset email');
      }
      
      setResetEmailSent(true);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for instructions to reset your password.",
      });
    } catch (error) {
      toast({
        title: "Failed to Send Reset Email",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReset(false);
    }
  }
  
  // If the user is already logged in, redirect to dashboard
  if (user) {
    return <Redirect to="/dashboard" />;
  }
  
  return (
    <>
      <Helmet>
        <title>Login or Register | ATSBoost</title>
        <meta name="description" content="Sign in to your ATSBoost account to access CV analysis, job matching, and enhance your job search in South Africa." />
      </Helmet>
      
      <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
        <div className="flex flex-col md:flex-row w-full max-w-6xl gap-8">
          {/* Left side - Auth forms */}
          <div className="w-full md:w-1/2">
            <Card className="w-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                  <TabsTrigger value="forgot-password">Reset Password</TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Username" {...field} />
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
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end mb-2">
                          <Button 
                            type="button" 
                            variant="link" 
                            className="px-0 h-auto text-xs"
                            onClick={() => setActiveTab("forgot-password")}
                          >
                            Forgot password?
                          </Button>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <span className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                              Logging in...
                            </>
                          ) : "Login"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </TabsContent>
                
                {/* Forgot Password Form */}
                <TabsContent value="forgot-password">
                  <CardHeader>
                    <CardTitle>Reset Your Password</CardTitle>
                    <CardDescription>
                      Enter your email address and we'll send you instructions to reset your password
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {resetEmailSent ? (
                      <div className="space-y-4 text-center">
                        <div className="rounded-full bg-green-100 text-green-800 p-2 w-12 h-12 mx-auto flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium">Email Sent!</h3>
                        <p className="text-muted-foreground">
                          Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
                        </p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => {
                            setResetEmailSent(false);
                            setActiveTab("login");
                          }}
                        >
                          Return to Login
                        </Button>
                      </div>
                    ) : (
                      <Form {...forgotPasswordForm}>
                        <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                          <FormField
                            control={forgotPasswordForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="your.email@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={isSubmittingReset}
                          >
                            {isSubmittingReset ? (
                              <>
                                <span className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                Sending Reset Link...
                              </>
                            ) : "Send Reset Link"}
                          </Button>
                          
                          <div className="text-center">
                            <Button
                              type="button"
                              variant="link"
                              onClick={() => setActiveTab("login")}
                              className="text-xs"
                            >
                              Remember your password? Login
                            </Button>
                          </div>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </TabsContent>
                
                {/* Registration Form */}
                <TabsContent value="register">
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                      Sign up to start optimizing your CV and boost your job search
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="your.email@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your full name" 
                                  value={field.value || ''}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  disabled={field.disabled}
                                  name={field.name}
                                  ref={field.ref}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <span className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                              Creating account...
                            </>
                          ) : "Register"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          {/* Right side - Hero section */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Optimize your CV for South African employers</h1>
              <p className="text-muted-foreground">
                ATSBoost helps job seekers in South Africa navigate the competitive job market by providing
                AI-powered CV analysis, targeted optimization, and specific recommendations for the South
                African job market.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground rounded-full flex items-center justify-center w-6 h-6 shrink-0">✓</div>
                  <p>ATS score with South African market alignment</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground rounded-full flex items-center justify-center w-6 h-6 shrink-0">✓</div>
                  <p>B-BBEE and NQF level optimization</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground rounded-full flex items-center justify-center w-6 h-6 shrink-0">✓</div>
                  <p>Provincial job market targeting</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground rounded-full flex items-center justify-center w-6 h-6 shrink-0">✓</div>
                  <p>WhatsApp notifications for job matches</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}