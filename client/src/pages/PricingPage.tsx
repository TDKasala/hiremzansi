import { Helmet } from "react-helmet";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";

export default function PricingPage() {
  return (
    <>
      <Helmet>
        <title>Pricing | ATSBoost - South African Resume Optimization</title>
        <meta name="description" content="Affordable CV optimization plans for South African job seekers. Choose from free ATS scoring, one-time deep analysis, or premium ongoing optimization." />
        <meta property="og:title" content="ATSBoost Pricing - CV Optimization for South Africans" />
        <meta property="og:description" content="Affordable CV optimization plans starting from free. Get your CV past ATS systems and land more interviews." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://atsboost.co.za/pricing" />
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
                    <th className="py-3 px-4 text-center border-b border-neutral-200">Free</th>
                    <th className="py-3 px-4 text-center border-b border-neutral-200">Deep Analysis</th>
                    <th className="py-3 px-4 text-center border-b border-neutral-200">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">ATS Score</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">CV Upload</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">1 CV</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">1 CV</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">Multiple CVs</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Keyword Analysis</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">Basic</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">Advanced</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">Advanced</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">WhatsApp Notifications</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Detailed PDF Report</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Real-time CV Editor</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">WhatsApp Job Alerts</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 border-b border-neutral-200 font-medium">Regional Job Matching</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✗</td>
                    <td className="py-3 px-4 border-b border-neutral-200 text-center">✓</td>
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
                    <td className="py-3 px-4 text-center">ZAR 30 <span className="text-sm">(once-off)</span></td>
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
