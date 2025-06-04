import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedUploadForm } from '@/components/AnimatedUploadForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, 
  Sparkles, 
  Brain, 
  Target, 
  Shield,
  CheckCircle,
  Star,
  TrendingUp
} from 'lucide-react';

export function ModernUploadPage() {
  const [, setLocation] = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (file: File, jobDescription?: string) => {
    setIsAnalyzing(true);
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
    // Navigate to results page
    setLocation('/results');
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your CV content, formatting, and structure",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "ATS Optimization",
      description: "Ensure your CV passes through Applicant Tracking Systems used by major companies",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "B-BBEE Compliance",
      description: "Optimize for South African employment equity and transformation requirements",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const benefits = [
    "Instant ATS compatibility score",
    "Detailed skills gap analysis",
    "Industry-specific recommendations",
    "South African market insights",
    "Professional formatting suggestions",
    "Keyword optimization guidance"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 pt-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-6 text-gray-600 hover:text-purple-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Free CV Analysis
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-6"
          >
            Upload Your CV for
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI-Powered Analysis
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
          >
            Get comprehensive feedback on your CV's ATS compatibility, 
            skills alignment, and optimization for the South African job market.
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <AnimatedUploadForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
            </motion.div>
          </div>

          {/* Features Sidebar */}
          <div className="space-y-8">
            {/* What You'll Get */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                    What You'll Get
                  </h3>
                  <div className="space-y-3">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={benefit}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center text-sm text-gray-700"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {benefit}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm group">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-r ${feature.color} p-3 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-300 fill-current" />
                    ))}
                  </div>
                  <h4 className="text-lg font-bold mb-2">Trusted by 50,000+ Users</h4>
                  <p className="text-purple-100 text-sm">
                    Join thousands of South Africans who've boosted their career prospects with Hire Mzansi
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="mt-20 py-16 bg-gradient-to-r from-gray-900 to-purple-900 text-white"
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Upload your CV now and discover how to optimize it for the South African job market
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Upload CV Above
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3"
              onClick={() => setLocation('/how-it-works')}
            >
              Learn How It Works
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}