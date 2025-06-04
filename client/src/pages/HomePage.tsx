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
        <title>Hire Mzansi - South African Job Marketplace & CV Optimization</title>
        <meta name="description" content="Hire Mzansi connects South African job seekers with opportunities while optimizing CVs for ATS systems. Get your free CV analysis today!" />
        <meta property="og:title" content="Hire Mzansi - South African Job Marketplace & CV Optimization" />
        <meta property="og:description" content="Connect with employers and optimize your CV for the South African job market with Hire Mzansi's comprehensive platform." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hiremzansi.co.za" />
      </Helmet>
      
      <HeroSection />
      <UploadSection />
      <WhatsAppPromoSection />
      <PremiumMatchingSection />
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
