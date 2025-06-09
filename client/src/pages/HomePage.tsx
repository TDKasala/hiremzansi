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
import { JobMatchingAnnouncement } from "@/components/JobMatchingAnnouncement";
import { CVOptimizationShowcase } from "@/components/CVOptimizationShowcase";
import { CVAnalysisFeatures } from "@/components/CVAnalysisFeatures";


export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Hire Mzansi - South African CV Optimization & ATS Analysis</title>
        <meta name="description" content="Optimize your CV for the South African job market with Hire Mzansi's AI-powered ATS analysis. Get your free CV optimization today!" />
        <meta property="og:title" content="Hire Mzansi - South African CV Optimization & ATS Analysis" />
        <meta property="og:description" content="Transform your CV for the South African job market with AI-powered optimization and ATS analysis tools." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hiremzansi.co.za" />
      </Helmet>
      
      <HeroSection />
      <UploadSection />
      <WhatsAppPromoSection />
      <CVOptimizationShowcase />
      <HowItWorksSection />
      <div className="container mx-auto px-4 py-8">
        <JobMatchingAnnouncement />
      </div>
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
