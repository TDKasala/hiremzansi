import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, User, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/recruiter/matches');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Helmet>
        <title>Payment Successful | Hire Mzansi</title>
        <meta name="description" content="Your payment was successful. Access your candidate contact details now." />
      </Helmet>

      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800 font-medium">
              Contact details have been unlocked
            </p>
            <p className="text-green-700 text-sm mt-1">
              You can now view and contact the candidate directly
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600">
              Your payment has been processed successfully. The candidate's contact information 
              is now available in your matches dashboard.
            </p>
            
            <p className="text-sm text-gray-500">
              Redirecting automatically in 5 seconds...
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/recruiter/matches')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <User className="h-4 w-4 mr-2" />
              View Contact Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/recruiter/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}