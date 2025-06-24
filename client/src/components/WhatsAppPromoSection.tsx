import React from 'react';
import { Link } from 'wouter';
import { Phone, ArrowRight, MessageCircle, Zap, Shield, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const WhatsAppPromoSection: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="bg-gradient-to-b from-neutral-50 to-white py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
          </div>
          
          <CardContent className="p-6 sm:p-8 lg:p-12 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                {/* Header with Badge */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-6">
                  <Badge className="bg-white text-green-700 hover:bg-white/90 font-semibold px-3 py-1 text-xs sm:text-sm">
                    🚀 NEW FEATURE
                  </Badge>
                  <div className="flex items-center gap-2 text-green-100">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm font-medium">WhatsApp Integration</span>
                  </div>
                </div>
                
                {/* Main Title */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                  Upload Your CV via 
                  <span className="block text-green-200">WhatsApp</span>
                </h2>
                
                {/* Description */}
                <p className="text-green-100 text-base sm:text-lg mb-6 leading-relaxed">
                  Get instant ATS scoring and CV analysis directly through WhatsApp. 
                  No app downloads, no registration - just send your CV and get professional feedback in minutes.
                </p>
                
                {/* Feature Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                  <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Zap className="h-4 w-4 text-green-200" />
                    <span className="text-sm font-medium">Instant Results</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Shield className="h-4 w-4 text-green-200" />
                    <span className="text-sm font-medium">Secure & Private</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Phone className="h-4 w-4 text-green-200" />
                    <span className="text-sm font-medium">Mobile-First</span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
                  <Link href="/whatsapp-upload">
                    <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 font-semibold shadow-lg w-full sm:w-auto h-12 sm:h-14 text-sm sm:text-base">
                      <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Try WhatsApp Upload
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                  <div className="text-green-200 text-sm">
                    Free • No registration required
                  </div>
                </div>
              </div>
              
              {/* Right Visual */}
              <div className="flex-shrink-0 lg:w-80">
                <div className="relative">
                  {/* Phone Mockup */}
                  <div className="bg-white rounded-3xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="bg-gray-900 rounded-2xl p-1">
                      <div className="bg-white rounded-xl overflow-hidden">
                        {/* WhatsApp Chat Simulation */}
                        <div className="bg-green-600 p-3 text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                              <MessageCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">Hire Mzansi</div>
                              <div className="text-xs opacity-90">Online</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-3 bg-green-50 min-h-[200px]">
                          {/* Chat Messages */}
                          <div className="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
                            <p className="text-xs text-gray-700">Send your CV document and I'll analyze it for you! 📄</p>
                          </div>
                          
                          <div className="bg-green-500 text-white rounded-lg p-3 shadow-sm max-w-[80%] ml-auto">
                            <p className="text-xs">📎 CV_John_Doe.pdf</p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
                            <div className="text-xs text-gray-700">
                              <div className="flex items-center gap-1 mb-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="font-medium">ATS Score: 85%</span>
                              </div>
                              <p>Great CV! Here are your optimization tips...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg animate-bounce">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-2 shadow-lg animate-pulse">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default WhatsAppPromoSection;