import { Helmet } from "react-helmet";
import HowItWorksSection from "@/components/HowItWorksSection";
import CTASection from "@/components/CTASection";

export default function HowItWorksPage() {
  return (
    <>
      <Helmet>
        <title>How It Works | ATSBoost - South African Resume Optimization</title>
        <meta name="description" content="Learn how ATSBoost helps South African job seekers optimize their CVs to pass ATS systems. Our 3-step process is simple and effective." />
        <meta property="og:title" content="How ATSBoost Works - CV Optimization for South Africans" />
        <meta property="og:description" content="Our 3-step process helps you optimize your CV for ATS systems used by South African employers." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://atsboost.co.za/how-it-works" />
      </Helmet>
      
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How ATSBoost Works</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Our simple process helps you optimize your CV for ATS systems and land more interviews
          </p>
        </div>
      </div>
      
      <HowItWorksSection />
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-secondary mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-neutral-100 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">What is an ATS system?</h3>
                <p className="text-neutral-600">
                  An Applicant Tracking System (ATS) is software used by employers to filter, sort, and rank job applications. 
                  It scans CVs for keywords and formatting before a human even sees them. Around 70% of South African employers use these systems.
                </p>
              </div>
              
              <div className="bg-neutral-100 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">How accurate is the ATS score?</h3>
                <p className="text-neutral-600">
                  Our ATS scoring system is based on analysis of South African job market requirements and actual ATS algorithms. 
                  While no system can guarantee 100% accuracy for every employer's ATS, our scoring provides a reliable benchmark for your CV's compatibility.
                </p>
              </div>
              
              <div className="bg-neutral-100 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">What file formats do you support?</h3>
                <p className="text-neutral-600">
                  We currently support PDF and DOCX formats for CV uploads. These are the two most common formats used by job seekers and are compatible with most ATS systems.
                </p>
              </div>
              
              <div className="bg-neutral-100 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Is my data secure?</h3>
                <p className="text-neutral-600">
                  Yes, we take data privacy seriously. We are POPIA compliant and implement industry-standard security measures. 
                  Your CV data is encrypted, and we never share your personal information with third parties without your explicit consent.
                </p>
              </div>
              
              <div className="bg-neutral-100 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Can I cancel my premium subscription?</h3>
                <p className="text-neutral-600">
                  Yes, you can cancel your premium subscription at any time. You'll continue to have access to premium features until the end of your current billing period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <CTASection />
    </>
  );
}
