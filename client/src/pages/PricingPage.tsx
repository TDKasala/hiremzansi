import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

const PricingPage = () => {
  const features = {
    free: {
      atsScore: true,
      basicRecommendations: true,
      keywordSuggestions: false,
      cvStorage: false,
      beforeAfterComparison: false,
      jobDescriptionMatching: false,
      unlimitedUploads: false,
      industrySpecificKeywords: false,
      pdfExport: false,
      prioritySupport: false
    },
    basic: {
      atsScore: true,
      basicRecommendations: true,
      keywordSuggestions: true,
      cvStorage: true,
      beforeAfterComparison: true,
      jobDescriptionMatching: false,
      unlimitedUploads: false,
      industrySpecificKeywords: false,
      pdfExport: false,
      prioritySupport: false
    },
    pro: {
      atsScore: true,
      basicRecommendations: true,
      keywordSuggestions: true,
      cvStorage: true,
      beforeAfterComparison: true,
      jobDescriptionMatching: true,
      unlimitedUploads: true,
      industrySpecificKeywords: true,
      pdfExport: true,
      prioritySupport: false
    },
    premium: {
      atsScore: true,
      basicRecommendations: true,
      keywordSuggestions: true,
      cvStorage: true,
      beforeAfterComparison: true,
      jobDescriptionMatching: true,
      unlimitedUploads: true,
      industrySpecificKeywords: true,
      pdfExport: true,
      prioritySupport: true
    }
  };

  const FeatureCheck = ({ included }: { included: boolean }) => {
    return included ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-gray-300" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">
            Choose the plan that's right for your job search needs in South Africa
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Free Plan */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">R0</span>
                <span className="text-gray-500 ml-2">/ Forever</span>
              </div>
            </CardHeader>
            <CardContent className="border-t border-b border-gray-100 py-6">
              <p className="text-gray-600 text-center mb-6">
                Basic ATS compatibility check for one CV
              </p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <FeatureCheck included={features.free.atsScore} />
                  <span className="ml-3 text-gray-700">Basic ATS Score</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.free.basicRecommendations} />
                  <span className="ml-3 text-gray-700">2 Strengths & 1 Improvement</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.free.keywordSuggestions} />
                  <span className="ml-3 text-gray-400">Keyword Suggestions</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.free.cvStorage} />
                  <span className="ml-3 text-gray-400">CV Storage</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.free.beforeAfterComparison} />
                  <span className="ml-3 text-gray-400">Before & After Comparison</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-6">
              <Button className="w-full" variant="outline">
                <Link href="/upload">Try Free</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Basic Plan */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Basic</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">R30</span>
                <span className="text-gray-500 ml-2">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="border-t border-b border-gray-100 py-6">
              <p className="text-gray-600 text-center mb-6">
                Essential features for entry-level job seekers
              </p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <FeatureCheck included={features.basic.atsScore} />
                  <span className="ml-3 text-gray-700">Detailed ATS Score</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.basic.basicRecommendations} />
                  <span className="ml-3 text-gray-700">Full Recommendations</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.basic.keywordSuggestions} />
                  <span className="ml-3 text-gray-700">Keyword Suggestions</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.basic.cvStorage} />
                  <span className="ml-3 text-gray-700">Store up to 3 CVs</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.basic.beforeAfterComparison} />
                  <span className="ml-3 text-gray-700">Before & After Comparison</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-6">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/signup?plan=basic">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-amber-500 shadow-lg hover:shadow-xl transition-shadow duration-300 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Pro</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">R100</span>
                <span className="text-gray-500 ml-2">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="border-t border-b border-gray-100 py-6">
              <p className="text-gray-600 text-center mb-6">
                Advanced features for serious job seekers
              </p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <FeatureCheck included={features.pro.atsScore} />
                  <span className="ml-3 text-gray-700">Comprehensive ATS Analysis</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.pro.keywordSuggestions} />
                  <span className="ml-3 text-gray-700">Advanced Keyword Suggestions</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.pro.cvStorage} />
                  <span className="ml-3 text-gray-700">Store up to 10 CVs</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.pro.jobDescriptionMatching} />
                  <span className="ml-3 text-gray-700">Job Description Matching</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.pro.industrySpecificKeywords} />
                  <span className="ml-3 text-gray-700">Industry-Specific Keywords</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.pro.pdfExport} />
                  <span className="ml-3 text-gray-700">PDF Export</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-6">
              <Button className="w-full bg-amber-500 hover:bg-amber-600">
                <Link href="/signup?plan=pro">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Premium</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">R200</span>
                <span className="text-gray-500 ml-2">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="border-t border-b border-gray-100 py-6">
              <p className="text-gray-600 text-center mb-6">
                Everything you need for a comprehensive job search
              </p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <FeatureCheck included={features.premium.atsScore} />
                  <span className="ml-3 text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.premium.unlimitedUploads} />
                  <span className="ml-3 text-gray-700">Unlimited CV Uploads</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={features.premium.prioritySupport} />
                  <span className="ml-3 text-gray-700">Priority Support</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={true} />
                  <span className="ml-3 text-gray-700">Interview Preparation</span>
                </li>
                <li className="flex items-center">
                  <FeatureCheck included={true} />
                  <span className="ml-3 text-gray-700">Personalized Recommendations</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-6">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/signup?plan=premium">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Compare Plan Features</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left font-medium text-gray-500">Feature</th>
                  <th className="py-4 px-6 text-center font-medium text-gray-500">Free</th>
                  <th className="py-4 px-6 text-center font-medium text-gray-500">Basic</th>
                  <th className="py-4 px-6 text-center font-medium text-gray-500">Pro</th>
                  <th className="py-4 px-6 text-center font-medium text-gray-500">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 text-left font-medium text-gray-900">ATS Score</td>
                  <td className="py-4 px-6 text-center">Basic</td>
                  <td className="py-4 px-6 text-center">Detailed</td>
                  <td className="py-4 px-6 text-center">Comprehensive</td>
                  <td className="py-4 px-6 text-center">Comprehensive</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 text-left font-medium text-gray-900">CV Recommendations</td>
                  <td className="py-4 px-6 text-center">Limited (3)</td>
                  <td className="py-4 px-6 text-center">Full Set</td>
                  <td className="py-4 px-6 text-center">Full Set</td>
                  <td className="py-4 px-6 text-center">Personalized</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-left font-medium text-gray-900">Keyword Suggestions</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">Basic</td>
                  <td className="py-4 px-6 text-center">Advanced</td>
                  <td className="py-4 px-6 text-center">Advanced</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 text-left font-medium text-gray-900">CV Storage</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">3 CVs</td>
                  <td className="py-4 px-6 text-center">10 CVs</td>
                  <td className="py-4 px-6 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-left font-medium text-gray-900">Before & After Comparison</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">✓</td>
                  <td className="py-4 px-6 text-center">✓</td>
                  <td className="py-4 px-6 text-center">✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 text-left font-medium text-gray-900">Job Description Matching</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">✓</td>
                  <td className="py-4 px-6 text-center">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-left font-medium text-gray-900">Industry-Specific Keywords</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">✓</td>
                  <td className="py-4 px-6 text-center">✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 text-left font-medium text-gray-900">PDF Export</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">✓</td>
                  <td className="py-4 px-6 text-center">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-left font-medium text-gray-900">Interview Preparation</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">✓</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 px-6 text-left font-medium text-gray-900">Priority Support</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access to your plan features until the end of your billing period.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">How does the ATS analysis work?</h3>
              <p className="text-gray-600">
                Our system analyzes your CV using similar algorithms to those used by South African employers' Applicant Tracking Systems. We check for formatting issues, keyword optimization, and content organization to provide you with a compatibility score and actionable recommendations.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Is my CV data secure?</h3>
              <p className="text-gray-600">
                Absolutely. We adhere to strict South African POPIA compliance standards. Your CV data is encrypted and securely stored, and we never share your personal information with third parties without your explicit consent.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit and debit cards, as well as PayFast payments, which is the preferred payment method for many South Africans.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Do you offer discounts for students?</h3>
              <p className="text-gray-600">
                Yes, we offer a 20% discount on our Basic and Pro plans for verified students. Contact our support team with your valid student ID for more information.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to Boost Your Job Search?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of South Africans who have improved their chances of landing interviews with ATSBoost.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
              <Link href="/signup?plan=pro">Get Started with Pro</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-amber-500 text-amber-600 hover:bg-amber-50">
              <Link href="/upload">Try for Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;