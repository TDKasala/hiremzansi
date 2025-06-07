import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WhatsAppUpload } from '@/components/WhatsAppUpload';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const WhatsAppUploadPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);
    
    try {
      const response = await apiRequest('POST', '/api/newsletter/subscribe', {
        email: email,
        source: 'whatsapp-upload-page'
      });

      if (response.ok) {
        toast({
          title: "Subscribed!",
          description: "You'll receive weekly job opportunities and CV tips",
        });
        setEmail('');
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Helmet>
        <title>WhatsApp CV Upload | Hire Mzansi</title>
        <meta name="description" content="Upload and analyze your CV via WhatsApp - Get your ATS score in minutes" />
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Upload Your CV via WhatsApp</h1>
        <p className="text-lg text-muted-foreground">
          Get your ATS score and recommendations directly on your phone
        </p>
      </div>
      
      {/* WhatsApp Upload Component at the top */}
      <div className="max-w-md mx-auto mb-12">
        <WhatsAppUpload />
      </div>
      
      {/* Simple How It Works */}
      <div className="bg-muted/30 p-6 rounded-lg border mb-8">
        <h2 className="text-xl font-semibold mb-4 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="bg-primary/10 text-primary font-bold rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">1</div>
            <p className="text-sm">Enter your WhatsApp number</p>
          </div>
          <div>
            <div className="bg-primary/10 text-primary font-bold rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">2</div>
            <p className="text-sm">Send your CV document</p>
          </div>
          <div>
            <div className="bg-primary/10 text-primary font-bold rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">3</div>
            <p className="text-sm">Get your ATS score instantly</p>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center"><span className="text-green-500 mr-1">✓</span> Secure & Private</span>
          <span className="flex items-center"><span className="text-green-500 mr-1">✓</span> No Login Required</span>
          <span className="flex items-center"><span className="text-green-500 mr-1">✓</span> Results in 2 Minutes</span>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-lg border text-center">
        <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get weekly job opportunities and CV tips delivered to your inbox
        </p>
        <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isSubscribing}
          />
          <button 
            type="submit"
            disabled={isSubscribing}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubscribing ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};

export default WhatsAppUploadPage;