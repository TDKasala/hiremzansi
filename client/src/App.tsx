import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { MotivationProvider } from "@/hooks/use-motivation";
import { ProtectedRoute } from "@/lib/protected-route";

import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import HowItWorksPage from "@/pages/HowItWorksPage";
import PricingPage from "@/pages/PricingPage";
import BlogPage from "@/pages/BlogPage";
import AboutPage from "@/pages/AboutPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import ContactPage from "@/pages/ContactPage";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import UploadPage from "@/pages/UploadPage";
import CVDetailsPage from "@/pages/CVDetailsPage";
import PremiumToolsPage from "@/pages/PremiumToolsPage";
import RealtimeATSPage from "@/pages/RealtimeATSPage";
import ReferralPage from "@/pages/ReferralPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import BlogPost1 from "@/pages/BlogPost1";
import NotFound from "@/pages/not-found";

// Import tool pages
import CoverLetterPage from "@/pages/tools/CoverLetterPage";
import CVTemplatesPage from "@/pages/tools/CVTemplatesPage";

// Import new blog posts
import BBBEEImpactSAResumes from "@/pages/blog/BBBEEImpactSAResumes";
import NQFLevelsExplained from "@/pages/blog/NQFLevelsExplained";
import ATSSurvivalGuide2025 from "@/pages/blog/ATSSurvivalGuide2025";
import RemoteWorkOpportunitiesSA from "@/pages/blog/RemoteWorkOpportunitiesSA";
import IndustrySpecificCVTips from "@/pages/blog/IndustrySpecificCVTips";
import LanguageProficiencyCV from "@/pages/blog/LanguageProficiencyCV";
import LinkedInOptimizationSAProfessionals from "@/pages/blog/LinkedInOptimizationSAProfessionals";
import GraduateCVTemplates from "@/pages/blog/GraduateCVTemplates";
import PersonalBrandingJobSearch from "@/pages/blog/PersonalBrandingJobSearch";
import AIToolsResumeOptimization from "@/pages/blog/AIToolsResumeOptimization";
import SouthAfricanCVGuide from "@/pages/blog/SouthAfricanCVGuide";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <MotivationProvider>
              <Layout>
                <Switch>
                  <Route path="/" component={HomePage} />
                  <Route path="/how-it-works" component={HowItWorksPage} />
                  <Route path="/pricing" component={PricingPage} />
                  <Route path="/blog" component={BlogPage} />
                  <Route path="/about" component={AboutPage} />
                  <Route path="/privacy" component={PrivacyPage} />
                  <Route path="/terms" component={TermsPage} />
                  <Route path="/contact" component={ContactPage} />
                  <Route path="/auth" component={AuthPage} />
                  <Route path="/realtime-ats" component={RealtimeATSPage} />
                  <Route path="/refer" component={ReferralPage} />
                  
                  {/* Original blog post */}
                  <Route path="/blog/7-ats-friendly-cv-tips-for-south-african-job-seekers" component={BlogPost1} />
                  
                  {/* New SEO-optimized blog posts */}
                  <Route path="/blog/b-bbee-impact-sa-resumes" component={BBBEEImpactSAResumes} />
                  <Route path="/blog/nqf-levels-explained" component={NQFLevelsExplained} />
                  <Route path="/blog/ats-survival-guide-2025" component={ATSSurvivalGuide2025} />
                  <Route path="/blog/remote-work-opportunities-sa" component={RemoteWorkOpportunitiesSA} />
                  <Route path="/blog/industry-specific-cv-tips" component={IndustrySpecificCVTips} />
                  <Route path="/blog/language-proficiency-cv" component={LanguageProficiencyCV} />
                  <Route path="/blog/linkedin-optimization-sa-professionals" component={LinkedInOptimizationSAProfessionals} />
                  <Route path="/blog/graduate-cv-templates" component={GraduateCVTemplates} />
                  <Route path="/blog/personal-branding-job-search" component={PersonalBrandingJobSearch} />
                  <Route path="/blog/ai-tools-resume-optimization" component={AIToolsResumeOptimization} />
                  <Route path="/blog/south-african-cv-guide" component={SouthAfricanCVGuide} />
                  
                  {/* Tool pages */}
                  <Route path="/tools/cover-letter" component={CoverLetterPage} />
                  <Route path="/tools/cv-templates" component={CVTemplatesPage} />
                  
                  {/* Protected routes requiring authentication */}
                  <ProtectedRoute path="/dashboard" component={DashboardPage} />
                  <ProtectedRoute path="/upload" component={UploadPage} />
                  <ProtectedRoute path="/cv/:id" component={CVDetailsPage} />
                  <ProtectedRoute path="/premium-tools" component={PremiumToolsPage} />
                  <ProtectedRoute path="/subscription" component={SubscriptionPage} />
                  <Route component={NotFound} />
                </Switch>
                <Toaster />
              </Layout>
            </MotivationProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
