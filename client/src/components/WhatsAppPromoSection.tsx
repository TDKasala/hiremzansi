import React from 'react';
import { Link } from 'wouter';
import { Phone, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

const WhatsAppPromoSection: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-8 shadow-md border border-sky-100">
          <div className="md:w-3/4 mb-6 md:mb-0">
            <div className="flex items-center mb-3">
              <Badge className="bg-amber-400 text-black mr-3">NEW</Badge>
              <h2 className="text-2xl font-bold text-blue-800">Upload Your CV via WhatsApp</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Need to analyze your CV on the go? Upload directly through WhatsApp and get instant ATS scoring and recommendations.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                <Phone className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">Fast &amp; Mobile-Friendly</span>
              </div>
              <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                <span className="text-blue-800 font-medium">No Login Required</span>
              </div>
              <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                <span className="text-blue-800 font-medium">Instant Results</span>
              </div>
            </div>
          </div>
          <div className="md:w-1/4 flex justify-center">
            <Link href="/whatsapp-upload" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Try Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppPromoSection;