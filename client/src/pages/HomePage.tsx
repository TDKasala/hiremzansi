import { Helmet } from "react-helmet";
import HeroSection from "@/components/HeroSection";
import UploadSection from "@/components/UploadSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import FeaturesSection from "@/components/FeaturesSection";
import SuccessStoriesSection from "@/components/SuccessStoriesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import SkillQuizSection from "@/components/SkillQuizSection";
import BlogPreviewSection from "@/components/BlogPreviewSection";
import ReferralSourceSection from "@/components/ReferralSourceSection";
import WhatsAppPromoSection from "@/components/WhatsAppPromoSection";
import CTASection from "@/components/CTASection";
import PremiumMatchingSection from "@/components/PremiumMatchingSection";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>ATSBoost - South African Resume Optimization Platform</title>
        <meta name="description" content="ATSBoost helps South African job seekers optimize their CVs to pass ATS systems and land more interviews. Get your free ATS score today!" />
        <meta property="og:title" content="ATSBoost - South African Resume Optimization Platform" />
        <meta property="og:description" content="Beat ATS systems and land your dream job with our CV optimization platform designed for South African job seekers." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://atsboost.co.za" />
      </Helmet>
      
      <HeroSection />
      <UploadSection />
      <PremiumMatchingSection />
      <WhatsAppPromoSection />
      <HowItWorksSection />
      <PricingSection />
      <FeaturesSection />
      <SuccessStoriesSection />
      <TestimonialsSection />
      <SkillQuizSection />
      <BlogPreviewSection />
      <ReferralSourceSection />
      <CTASection />
    </>
  );
}
