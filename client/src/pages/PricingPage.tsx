import { Helmet } from "react-helmet";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";

export default function PricingPage() {
  return (
    <>
      <Helmet>
        <title>Affordable CV Optimization Pricing for South African Job Seekers | Free ATS Analysis | Hire Mzansi</title>
        <meta name="description" content="Choose from affordable CV optimization plans starting at R25. Free ATS analysis, B-BBEE compliance checking, and premium features for South African professionals. 50% launch discount available!" />
        <meta name="keywords" content="CV optimization pricing South Africa, affordable resume builder SA, ATS analysis cost, B-BBEE CV pricing, professional CV services South Africa, job search tools pricing, career development cost, CV writing services rates" />
        <meta property="og:title" content="Affordable CV Optimization Plans for South African Professionals - Hire Mzansi" />
        <meta property="og:description" content="Transform your career with affordable CV optimization plans. Starting at R25 with 50% launch discount. Free ATS analysis, B-BBEE compliance, and professional features." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hiremzansi.co.za/pricing" />
        <meta property="og:image" content="https://hiremzansi.co.za/images/pricing-preview.jpg" />
        <meta property="og:locale" content="en_ZA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Affordable CV Optimization Plans - Hire Mzansi" />
        <meta name="twitter:description" content="Professional CV optimization from R25. Free ATS analysis, B-BBEE compliance, 50% launch discount. Perfect for SA job seekers!" />
        <meta name="twitter:image" content="https://hiremzansi.co.za/images/pricing-twitter.jpg" />
        <link rel="canonical" href="https://hiremzansi.co.za/pricing" />
      </Helmet>
      
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Choose the plan that fits your needs and budget
          </p>
        </div>
      </div>
      
      <PricingSection />
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-secondary mb-8 text-center">Compare Plans</h2>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full bg-white border border-neutral-200 rounded-lg">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="py-4 px-6 text-left border-b border-neutral-200 font-semibold">Feature</th>
                    <th className="py-4 px-6 text-center border-b border-neutral-200 font-semibold">Free Trial</th>
                    <th className="py-4 px-6 text-center border-b border-neutral-200 font-semibold">Essential Pack</th>
                    <th className="py-4 px-6 text-center border-b border-neutral-200 font-semibold">Professional</th>

                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-4 px-6 border-b border-neutral-200 font-medium">Price</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center font-bold">ZAR 0</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center">
                      <div className="text-sm text-gray-500 line-through">ZAR 49</div>
                      <div className="font-bold text-green-600">ZAR 25</div>
                      <div className="text-xs text-red-500 font-medium">50% OFF</div>
                    </td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center">
                      <div className="text-sm text-gray-500 line-through">ZAR 99/month</div>
                      <div className="font-bold text-green-600">ZAR 50/month</div>
                      <div className="text-xs text-red-500 font-medium">50% OFF</div>
                    </td>

                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-4 px-6 border-b border-neutral-200 font-medium">CV Analysis Credits</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center">1 (7 days)</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center">5 (30 days)</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center">15/month</td>

                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-4 px-6 border-b border-neutral-200 font-medium">ATS Score</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-green-600">✓</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-green-600">✓</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-green-600">✓</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-4 px-6 border-b border-neutral-200 font-medium">Detailed PDF Report</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-red-500">✗</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-green-600">✓</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-green-600">✓</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-4 px-6 border-b border-neutral-200 font-medium">B-BBEE Optimization</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-red-500">✗</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-green-600">✓</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-green-600">✓</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-4 px-6 border-b border-neutral-200 font-medium">Real-time CV Editor</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-red-500">✗</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-red-500">✗</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-green-600">✓</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-4 px-6 border-b border-neutral-200 font-medium">Priority Support</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-red-500">✗</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-red-500">✗</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-green-600">✓</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-4 px-6 border-b border-neutral-200 font-medium">Template Library Access</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-red-500">✗</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-red-500">✗</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-green-600">✓</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-4 px-6 border-b border-neutral-200 font-medium">Industry Benchmarking</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-red-500">✗</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-red-500">✗</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-green-600">✓</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-4 px-6 border-b border-neutral-200 font-medium">Export Multiple Formats</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-red-500">✗</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-red-500">✗</td>
                    <td className="py-4 px-6 border-b border-neutral-200 text-center text-green-600">✓</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="py-4 px-6 font-medium">SA-Specific Recommendations</td>
                    <td className="py-4 px-6 text-center">Basic</td>
                    <td className="py-4 px-6 text-center">Detailed</td>
                    <td className="py-4 px-6 text-center">Detailed</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-6">
              {/* Free Trial Card */}
              <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-secondary mb-2">Free Trial</h3>
                  <div className="text-2xl font-bold">ZAR 0</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">CV Analysis Credits</span>
                    <span className="text-sm">1 (7 days)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">ATS Score</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">Detailed PDF Report</span>
                    <span className="text-red-500">✗</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">B-BBEE Optimization</span>
                    <span className="text-red-500">✗</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">SA-Specific Recommendations</span>
                    <span className="text-sm">Basic</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium">Advanced Features</span>
                    <span className="text-red-500">✗</span>
                  </div>
                </div>
              </div>

              {/* Essential Pack Card */}
              <div className="bg-white border-2 border-primary rounded-lg p-6 shadow-lg relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <div className="text-center mb-6 mt-4">
                  <h3 className="text-xl font-bold text-secondary mb-2">Essential Pack</h3>
                  <div className="text-sm text-gray-500 line-through">ZAR 49</div>
                  <div className="text-2xl font-bold text-green-600">ZAR 25</div>
                  <div className="text-sm text-red-500 font-medium">50% OFF</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">CV Analysis Credits</span>
                    <span className="text-sm">5 (30 days)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">ATS Score</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">Detailed PDF Report</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">B-BBEE Optimization</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">SA-Specific Recommendations</span>
                    <span className="text-sm">Detailed</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium">Advanced Features</span>
                    <span className="text-red-500">✗</span>
                  </div>
                </div>
              </div>

              {/* Professional Card */}
              <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-secondary mb-2">Professional</h3>
                  <div className="text-sm text-gray-500 line-through">ZAR 99/month</div>
                  <div className="text-2xl font-bold text-green-600">ZAR 50/month</div>
                  <div className="text-sm text-red-500 font-medium">50% OFF</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">CV Analysis Credits</span>
                    <span className="text-sm">15/month</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">ATS Score</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">Detailed PDF Report</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">Real-time CV Editor</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                    <span className="text-sm font-medium">Priority Support</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium">Template Library</span>
                    <span className="text-green-600">✓</span>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </section>
      
      <CTASection />
    </>
  );
}
