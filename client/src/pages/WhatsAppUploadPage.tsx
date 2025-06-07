import React from 'react';
import { useTranslation } from 'react-i18next';
import { WhatsAppUpload } from '@/components/WhatsAppUpload';
import { Helmet } from 'react-helmet';

const WhatsAppUploadPage: React.FC = () => {
  const { t } = useTranslation();
  
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
      <div className="text-center">
        <div className="inline-flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center"><span className="text-green-500 mr-1">✓</span> Secure & Private</span>
          <span className="flex items-center"><span className="text-green-500 mr-1">✓</span> No Login Required</span>
          <span className="flex items-center"><span className="text-green-500 mr-1">✓</span> Results in 2 Minutes</span>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppUploadPage;