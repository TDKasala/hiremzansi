import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";
import { MotivationProvider } from "./hooks/use-motivation";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ScrollToTop } from "@/lib/scroll-to-top";

import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import { ModernHomePage } from "@/pages/ModernHomePage";
import { ModernUploadPage } from "@/pages/ModernUploadPage";
import HowItWorksPage from "@/pages/HowItWorksPage";
import PricingPage from "@/pages/PricingPage";
import SimpleBlogPage from "@/pages/SimpleBlogPage";
import AboutPage from "@/pages/AboutPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import ContactPage from "@/pages/ContactPage";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ProfilePage } from "./pages/ProfilePage";
import AuthCallback from "./pages/AuthCallback";
import UploadPage from "@/pages/UploadPage";
import CVDetailsPage from "@/pages/CVDetailsPage";
import LatestCVPage from "@/pages/LatestCVPage";
import DeepAnalysisPage from "@/pages/DeepAnalysisPage";
// Using our new ProfilePage with Supabase integration
import PremiumToolsPage from "@/pages/PremiumToolsPage";
import RealtimeATSPage from "@/pages/RealtimeATSPage";
import JobSeekerToolsPage from "@/pages/JobSeekerToolsPage";
import ATSResultsPage from "@/pages/ATSResultsPage";
import MotivationDemoPage from "@/pages/MotivationDemoPage";
import MotivationDashboard from "@/pages/MotivationDashboard";
import LocalAIDemoPage from "@/pages/LocalAIDemoPage";
import SouthAfricanAIDemo from "@/pages/SouthAfricanAIDemo";
import ReferralPage from "@/pages/ReferralPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import WhatsAppUploadPage from "@/pages/WhatsAppUploadPage";
import TemplatesPage from "@/pages/TemplatesPage";
import SettingsPage from "@/pages/settings-page";
import BlogPost1 from "@/pages/BlogPost1";
import { AdminDashboard } from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import BlogDetailPage from "@/pages/BlogDetailPage";

// Import premium matching pages
import PremiumJobSeekerPage from "@/pages/PremiumJobSeekerPage";
import PremiumRecruiterPage from "@/pages/PremiumRecruiterPage";

// Import job search pages
import JobsPage from "@/pages/JobsPage";
import JobDetailsPage from "@/pages/JobDetailsPage";
import JobSitesPage from "@/pages/JobSitesPage";
import JobRecommendationsPage from "@/pages/JobRecommendationsPage";
import IndustryTemplatesPage from "@/pages/IndustryTemplatesPage";
import InterviewPracticePage from "@/pages/InterviewPracticePage";
import SkillGapAnalyzerPage from "@/pages/SkillGapAnalyzerPage";

// Import tool pages
import CoverLetterPage from "@/pages/tools/CoverLetterPage";
import CVTemplatesPage from "@/pages/tools/CVTemplatesPage";
import ATSKeywordsPage from "@/pages/tools/ATSKeywordsPage";
import CoverLetterIdeasPage from "@/pages/tools/CoverLetterIdeasPage";
import CVChecklistPage from "@/pages/tools/CVChecklistPage";
import JobFitQuizPage from "@/pages/tools/JobFitQuizPage";
import InterviewGuidePage from "@/pages/tools/InterviewGuidePage";

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
              <ScrollToTop />
              <Switch>
                <Route path="/" component={ModernHomePage} />
                <Route path="/how-it-works" component={HowItWorksPage} />
                <Route path="/pricing" component={PricingPage} />
                <Route path="/blog" component={SimpleBlogPage} />
                <Route path="/about" component={AboutPage} />
                <Route path="/privacy" component={PrivacyPage} />
                <Route path="/terms" component={TermsPage} />
                <Route path="/contact" component={ContactPage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/signup" component={SignUpPage} />
                <Route path="/auth" component={LoginPage} />
                <Route path="/auth/callback" component={AuthCallback} />
                <Route path="/realtime-ats" component={RealtimeATSPage} />
                <Route path="/refer" component={ReferralPage} />
                <Route path="/whatsapp-upload" component={WhatsAppUploadPage} />
                <Route path="/templates" component={TemplatesPage} />
                
                {/* Premium matching routes */}
                <Route path="/premium-matching/jobseeker" component={PremiumJobSeekerPage} />
                <Route path="/premium-matching/recruiter" component={PremiumRecruiterPage} />
                
                {/* Original blog post */}
                <Route path="/blog/7-ats-friendly-cv-tips-for-south-african-job-seekers" component={BlogPost1} />
                
                {/* New SEO-optimized blog posts */}
                <Route path="/blog/b-bbee-impact-sa-resumes" component={BBBEEImpactSAResumes} />
                <Route path="/blog/nqf-levels-explained" component={NQFLevelsExplained} />
                <Route path="/blog/ats-survival-guide-2025" component={ATSSurvivalGuide2025} />
                <Route path="/blog/ATSSurvivalGuide2025" component={ATSSurvivalGuide2025} />
                <Route path="/blog/remote-work-opportunities-sa" component={RemoteWorkOpportunitiesSA} />
                <Route path="/blog/industry-specific-cv-tips" component={IndustrySpecificCVTips} />
                <Route path="/blog/language-proficiency-cv" component={LanguageProficiencyCV} />
                <Route path="/blog/linkedin-optimization-sa-professionals" component={LinkedInOptimizationSAProfessionals} />
                <Route path="/blog/graduate-cv-templates" component={GraduateCVTemplates} />
                <Route path="/blog/personal-branding-job-search" component={PersonalBrandingJobSearch} />
                <Route path="/blog/ai-tools-resume-optimization" component={AIToolsResumeOptimization} />
                <Route path="/blog/south-african-cv-guide" component={SouthAfricanCVGuide} />
                
                {/* Generic blog detail page handler for dynamic paths */}
                <Route path="/blog/:slug" component={BlogDetailPage} />
                
                {/* Tool pages */}
                <Route path="/tools/cover-letter" component={CoverLetterPage} />
                <Route path="/tools/cv-templates" component={CVTemplatesPage} />
                <Route path="/tools/ats-keywords" component={ATSKeywordsPage} />
                <Route path="/tools/cover-letter-ideas" component={CoverLetterIdeasPage} />
                <Route path="/tools/cv-checklist" component={CVChecklistPage} />
                <Route path="/tools/job-fit-quiz" component={JobFitQuizPage} />
                <Route path="/tools/interview-guide" component={InterviewGuidePage} />
                
                {/* Job search and career advancement pages */}
                <Route path="/jobs" component={JobsPage} />
                <Route path="/job/:id" component={JobDetailsPage} />
                <Route path="/job-sites" component={JobSitesPage} />
                <ProtectedRoute path="/job-recommendations" component={JobRecommendationsPage} />
                <Route path="/industry-templates" component={IndustryTemplatesPage} />
                <ProtectedRoute path="/interview/practice" component={InterviewPracticePage} />
                <ProtectedRoute path="/skills/analyze" component={SkillGapAnalyzerPage} />
                
                {/* Protected routes requiring authentication */}
                <ProtectedRoute path="/dashboard" component={DashboardPage} />
                <Route path="/upload" component={ModernUploadPage} />
                <ProtectedRoute path="/cv/:id" component={CVDetailsPage} />
                <ProtectedRoute path="/cv/latest" component={LatestCVPage} />
                <ProtectedRoute path="/deep-analysis" component={DeepAnalysisPage} />
                <Route path="/ats-results" component={ATSResultsPage} />
                <Route path="/motivation-demo" component={MotivationDemoPage} />
                <Route path="/motivation-dashboard" component={MotivationDashboard} />
                <Route path="/local-ai-demo" component={LocalAIDemoPage} />
                <Route path="/sa-ai-demo" component={SouthAfricanAIDemo} />
                <ProtectedRoute path="/profile" component={ProfilePage} />
                <ProtectedRoute path="/settings" component={SettingsPage} />
                <ProtectedRoute path="/premium-tools" component={PremiumToolsPage} />
                <Route path="/job-seeker-tools" component={JobSeekerToolsPage} />
                <ProtectedRoute path="/subscription" component={SubscriptionPage} />
                <ProtectedRoute path="/admin" component={AdminDashboard} />
                
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
