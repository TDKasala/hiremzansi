import React from 'react';
import { useTranslation } from 'react-i18next';
import { WhatsAppUpload } from '@/components/WhatsAppUpload';
import { Helmet } from 'react-helmet';

const WhatsAppUploadPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <Helmet>
        <title>{t('Upload CV via WhatsApp')} | ATSBoost</title>
        <meta name="description" content={t('Easily upload and analyze your CV using WhatsApp with ATSBoost')} />
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('Upload Your CV via WhatsApp')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('Quickly analyze your CV using our WhatsApp integration. Get your ATS score directly on your phone.')}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
            <h2 className="text-xl font-semibold mb-4">{t('Benefits of WhatsApp Upload')}</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>{t('Fast & Convenient: Upload directly from your phone')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>{t('Get instant ATS scores and recommendations')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>{t('No login required for basic analysis')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>{t('Works with PDF and Word documents')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>{t('Optimized for South African job market')}</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">{t('How It Works')}</h2>
            <ol className="space-y-4">
              <li className="flex">
                <span className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">1</span>
                <p>{t('Verify your WhatsApp number (one-time process)')}</p>
              </li>
              <li className="flex">
                <span className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">2</span>
                <p>{t('Send your CV as a PDF or Word document via WhatsApp')}</p>
              </li>
              <li className="flex">
                <span className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">3</span>
                <p>{t('Receive your ATS score and recommendations within minutes')}</p>
              </li>
              <li className="flex">
                <span className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">4</span>
                <p>{t('Create an account to access detailed analysis and improvement tips')}</p>
              </li>
            </ol>
          </div>
        </div>
        
        <div>
          <WhatsAppUpload />
        </div>
      </div>
      
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4 text-center">{t('Frequently Asked Questions')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-medium">{t('Is my CV data secure?')}</h3>
            <p className="text-muted-foreground">{t('Yes, we use industry-standard encryption and your data is only used for analysis purposes.')}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">{t('How long does the analysis take?')}</h3>
            <p className="text-muted-foreground">{t('You will receive your ATS score and key recommendations within 2 minutes.')}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">{t('Do I need to create an account?')}</h3>
            <p className="text-muted-foreground">{t('No, but creating an account gives you access to detailed reports and CV improvement tools.')}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">{t('Will I receive marketing messages?')}</h3>
            <p className="text-muted-foreground">{t('We only send CV analysis results and job-related updates. You can opt out at any time.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppUploadPage;