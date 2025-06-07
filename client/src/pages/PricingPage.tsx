import { Helmet } from "react-helmet";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";

export default function PricingPage() {
  return (
    <>
      <Helmet>
        <title>Pricing | Hire Mzansi - South African Resume Optimization</title>
        <meta name="description" content="Affordable CV optimization plans for South African job seekers. Choose from free ATS scoring, one-time deep analysis, or premium ongoing optimization." />
        <meta property="og:title" content="Hire Mzansi Pricing - CV Optimization for South Africans" />
        <meta property="og:description" content="Affordable CV optimization plans starting from free. Get your CV past ATS systems and land more interviews." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hiremzansi.co.za/pricing" />
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
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-secondary mb-6 text-center">Compare Plans</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-neutral-200">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="py-3 px-4 text-left border-b border-neutral-200">Feature</th>
                    <th className="py-3 px-4 text-center border-b border-neutral-200">Free Trial</th>
                    <th className="py-3 px-4 text-center border-b border-neutral-200">Essential Pack</th>
                    <th className="py-3 px-4 text-center border-b border-neutral-200">Professional</th>
                    <th className="py-3 px-4 text-center border-b border-neutral-200">Business Annual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Price</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center font-bold">ZAR 0</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">
                      <div className="text-sm text-gray-500 line-through">ZAR 49</div>
                      <div className="font-bold text-green-600">ZAR 25</div>
                      <div className="text-xs text-red-500">50% OFF</div>
                    </td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">
                      <div className="text-sm text-gray-500 line-through">ZAR 99/month</div>
                      <div className="font-bold text-green-600">ZAR 50/month</div>
                      <div className="text-xs text-red-500">50% OFF</div>
                    </td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">
                      <div className="text-sm text-gray-500 line-through">ZAR 999/year</div>
                      <div className="font-bold text-green-600">ZAR 500/year</div>
                      <div className="text-xs text-red-500">50% OFF</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">CV Analysis Credits</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">1 (7 days)</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">5 (30 days)</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">15/month</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">20/month</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">ATS Score</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Detailed PDF Report</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">B-BBEE Optimization</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Real-time CV Editor</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Priority Support</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Template Library Access</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Industry Benchmarking</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Export Multiple Formats</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Bulk Analysis Tools</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">API Access</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Annual Savings</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">-</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">-</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">-</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center text-green-600">15% (ZAR 189)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">SA-Specific Recommendations</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">Basic</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">Detailed</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">Detailed</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Priority Support</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Price</td>
                    <td className="py-3 px-4 text-center">Free</td>
                    <td className="py-3 px-4 text-center">R49 <span className="text-sm">(once-off)</span></td>
                    <td className="py-3 px-4 text-center">ZAR 100 <span className="text-sm">/month</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      
      <CTASection />
    </>
  );
}
