import { useState } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartLine, Info } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  name: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [location, navigate] = useLocation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();

  // If already logged in, redirect to home
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 md:py-16">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col space-y-8 items-start">
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <ChartLine className="h-10 w-10 text-primary" />
                  <h1 className="text-3xl font-bold tracking-tight">ATSBoost</h1>
                </div>
                <p className="text-muted-foreground mt-2">
                  Your AI-powered CV optimizer for the South African job market
                </p>
              </div>

              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to your ATSBoost account to continue
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
                            <FormLabel>Username or Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username or email" {...field} />
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
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                  <div className="text-center">
                    Don't have an account?{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("register")}>
                      Register now
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Join ATSBoost to get your CV optimized for South African job listings
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
                              <Input placeholder="Choose a username" {...field} />
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
                              <Input type="email" placeholder="Enter your email" {...field} />
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
                            <FormLabel>
                              Full Name <span className="text-muted-foreground">(Optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
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
                              <Input type="password" placeholder="Create a password" {...field} />
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
                              <Input type="password" placeholder="Confirm your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="bg-blue-50 p-3 rounded-md flex items-start space-x-2 text-sm text-blue-700 border border-blue-100">
                        <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
                          <p className="mt-1">Your data will be stored in South Africa in accordance with POPIA.</p>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                  <div className="text-center">
                    Already have an account?{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("login")}>
                      Sign in
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden md:block bg-gradient-to-br from-primary to-primary/80 p-8 rounded-lg shadow-xl text-white">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Why Join ATSBoost?</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">🇿🇦 South African Focused</h3>
                <p>Our CV analysis is specifically tuned for the South African job market, including B-BBEE and NQF considerations.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">⚡ ATS Optimization</h3>
                <p>Get instant feedback on how well your CV performs against Applicant Tracking Systems used by local employers.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">📊 Detailed Analysis</h3>
                <p>Receive actionable recommendations to improve your CV's visibility and relevance for your target roles.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">🔐 POPIA Compliant</h3>
                <p>Your data is secured and handled in accordance with South Africa's Protection of Personal Information Act.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}