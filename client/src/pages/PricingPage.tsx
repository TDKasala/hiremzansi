import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';

const plans = [
  {
    name: 'Free',
    price: 'R0',
    description: 'Basic ATS score check',
    features: [
      'Basic ATS score analysis',
      '2 strengths identified',
      '1 improvement suggestion',
      'Limited recommendations'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Essential',
    price: 'R30',
    description: 'One-time CV optimization',
    features: [
      'Full ATS score analysis',
      'Comprehensive recommendations',
      'Keyword optimization',
      'Format improvements',
      'B-BBEE & NQF guidance'
    ],
    cta: 'Upgrade Now',
    popular: false
  },
  {
    name: 'Premium',
    price: 'R100',
    description: 'Continuous CV improvement',
    features: [
      'Everything in Essential',
      'Unlimited CV uploads',
      'Before/After comparison',
      'Progress tracking',
      'South African job market tips',
      'Industry-specific keywords'
    ],
    cta: 'Choose Premium',
    popular: true
  },
  {
    name: 'Professional',
    price: 'R200',
    description: 'Complete career support',
    features: [
      'Everything in Premium',
      'Interview practice with AI',
      'Personalized feedback',
      'Skill gap analysis',
      'South African job matching',
      'Email support'
    ],
    cta: 'Choose Professional',
    popular: false
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const PricingPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center max-w-3xl mx-auto mb-12">
        <motion.h1 
          className="text-3xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Pricing Plans for South African Job Seekers
        </motion.h1>
        <motion.p 
          className="text-lg text-gray-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Choose the plan that best fits your career stage and needs
        </motion.p>
      </header>
      
      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {plans.map((plan, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className={`h-full flex flex-col ${plan.popular ? 'border-amber-500 shadow-lg' : 'border-gray-200'}`}>
              {plan.popular && (
                <div className="bg-amber-500 text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.name !== 'Free' && <span className="text-sm text-gray-500 ml-1">/ one-time</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={user ? "/payment" : "/auth"}>
                  <Button className={`w-full ${plan.popular ? 'bg-amber-500 hover:bg-amber-600' : ''}`}>
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      <div className="bg-gray-50 rounded-lg p-8 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
            <h2 className="text-2xl font-bold mb-4">Why ATSBoost?</h2>
            <p className="text-gray-600 mb-4">
              ATSBoost is specifically designed for the South African job market, with features focused on local requirements like B-BBEE status, NQF qualifications, and industry-specific terminology that local employers are looking for.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-amber-500 mr-2 shrink-0" />
                <div>
                  <h3 className="font-medium">South African Focus</h3>
                  <p className="text-sm text-gray-500">Optimized for local job market requirements</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-amber-500 mr-2 shrink-0" />
                <div>
                  <h3 className="font-medium">Track Progress</h3>
                  <p className="text-sm text-gray-500">See your CV improvements over time</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-amber-500 mr-2 shrink-0" />
                <div>
                  <h3 className="font-medium">ATS Optimization</h3>
                  <p className="text-sm text-gray-500">Beat the applicant tracking systems</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-amber-500 mr-2 shrink-0" />
                <div>
                  <h3 className="font-medium">Expert Support</h3>
                  <p className="text-sm text-gray-500">Local job market insights and advice</p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="font-bold text-lg mb-3">Need Custom Solutions?</h3>
              <p className="text-gray-600 mb-4">
                Contact us for corporate plans or special requirements for organizations.
              </p>
              <Link href="/contact">
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8 text-left">
          <div>
            <h3 className="font-bold mb-2">Is my payment secure?</h3>
            <p className="text-gray-600">
              Yes, all payments are processed securely through PayFast, a trusted South African payment gateway.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Can I upgrade my plan later?</h3>
            <p className="text-gray-600">
              Absolutely! You can upgrade from any plan to a higher tier at any time.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">What file formats do you support?</h3>
            <p className="text-gray-600">
              We support PDF, DOCX, and DOC file formats for CV uploads.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">How does the South African optimization work?</h3>
            <p className="text-gray-600">
              We analyze your CV for local elements like B-BBEE status, NQF qualifications, and South African industry terminology to ensure maximum relevance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;