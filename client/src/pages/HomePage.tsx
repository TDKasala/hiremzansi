import { Helmet } from "react-helmet";
import HeroSection from "@/components/HeroSection";
import UploadSection from "@/components/UploadSection";

import PricingSection from "@/components/PricingSection";
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
import { PremiumRecruiterSection } from "@/components/PremiumRecruiterSection";
import { JobSeekerMatchingBanner } from "@/components/JobSeekerBenefitsAlert";


export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Hire Mzansi - AI-Powered CV Optimization for South African Job Market | ATS-Friendly Resume Builder</title>
        <meta name="description" content="Land your dream job in South Africa with AI-powered CV optimization. Get ATS-compatible resumes, B-BBEE compliance analysis, NQF level matching, and job market insights. Free CV analysis available - start optimizing today!" />
        <meta name="keywords" content="CV optimization South Africa, ATS friendly resume, B-BBEE CV analysis, South African job search, resume builder SA, employment equity CV, NQF levels, career development, job matching, professional CV writing" />
        <meta property="og:title" content="Hire Mzansi - #1 AI CV Optimization Platform for South African Professionals" />
        <meta property="og:description" content="Transform your career with AI-powered CV optimization built for South Africa. Beat ATS systems, ensure B-BBEE compliance, and access local job market insights. Try free analysis now!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hiremzansi.co.za" />
        <meta property="og:image" content="https://hiremzansi.co.za/images/homepage-preview.jpg" />
        <meta property="og:locale" content="en_ZA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI CV Optimization for South Africa - Hire Mzansi" />
        <meta name="twitter:description" content="Get your CV noticed by SA employers. ATS-friendly optimization, B-BBEE compliance, and local market insights. Free analysis available!" />
        <meta name="twitter:image" content="https://hiremzansi.co.za/images/twitter-card.jpg" />
        <link rel="canonical" href="https://hiremzansi.co.za/" />
      </Helmet>
      
      <HeroSection />
      <UploadSection />
      <WhatsAppPromoSection />
      <CVOptimizationShowcase />
      <PremiumRecruiterSection />
      <JobSeekerMatchingBanner />
      <PricingSection />
      <SuccessStoriesSection />
      <TestimonialsSection />
      <SkillQuizSection />
      <JobMatchingAnnouncement />
      <BlogPreviewSection />
      <ReferralSourceSection />
      <CTASection />
    </>
  );
}
