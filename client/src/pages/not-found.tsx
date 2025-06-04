import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft, Search } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center bg-gray-50 px-4">
      <Helmet>
        <title>Page Not Found | Hire Mzansi - South African CV Optimization</title>
        <meta 
          name="description" 
          content="The page you're looking for cannot be found. Return to Hire Mzansi's home page to optimize your CV for South African employers." 
        />
      </Helmet>
      
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-600 max-w-sm">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <Link href="/">
              <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Home Page
              </Button>
            </Link>
            
            <Link href="/blog">
              <Button variant="outline" className="w-full" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Blog
              </Button>
            </Link>
          </div>
          
          <div className="border-t border-gray-200 pt-5 mt-2">
            <p className="text-sm text-gray-500 mb-3">Popular pages you might be looking for:</p>
            <ul className="text-sm text-primary space-y-2">
              <li>
                <Link href="/upload" className="hover:underline flex items-center">
                  <Search className="h-3 w-3 mr-2 inline-block" />
                  Free ATS Score Checker
                </Link>
              </li>
              <li>
                <Link href="/blog/ats-survival-guide-2025" className="hover:underline flex items-center">
                  <Search className="h-3 w-3 mr-2 inline-block" />
                  2025 ATS Survival Guide
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:underline flex items-center">
                  <Search className="h-3 w-3 mr-2 inline-block" />
                  Premium Tools & Pricing
                </Link>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
