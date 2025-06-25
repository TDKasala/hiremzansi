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
import { EmailVerificationHandler } from "./components/EmailVerificationHandler";

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
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import AuthCallback from "./pages/AuthCallback";
import UploadPage from "@/pages/UploadPage";
import CVDetailsPage from "@/pages/CVDetailsPage";
import XAITestPage from "./pages/XAITestPage";
import LatestCVPage from "@/pages/LatestCVPage";
import DeepAnalysisPage from "@/pages/DeepAnalysisPage";
// Using our new ProfilePage with Supabase integration
import PremiumToolsPage from "@/pages/PremiumToolsPage";
import RealtimeATSPage from "@/pages/RealtimeATSPage";
import JobSeekerToolsPage from "@/pages/JobSeekerToolsPage";
import ATSResultsPage from "@/pages/ATSResultsPage";

import MotivationDashboard from "@/pages/MotivationDashboard";
import LocalAIDemoPage from "@/pages/LocalAIDemoPage";
import SouthAfricanAIDemo from "@/pages/SouthAfricanAIDemo";
import ReferralPage from "@/pages/ReferralPage";
import ReferralDashboard from "@/pages/ReferralDashboard";
import JobSitesPage from "@/pages/JobSitesPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import WhatsAppUploadPage from "@/pages/WhatsAppUploadPage";
import TemplatesPage from "@/pages/TemplatesPage";
import SettingsPage from "@/pages/settings-page";
import PremiumRecruiterMatchingPage from "@/pages/PremiumRecruiterMatchingPage";
import RecruiterDashboard from "@/pages/RecruiterDashboard";
import JobSeekerProfile from "@/pages/JobSeekerProfile";
import RecruiterSignupPage from "@/pages/RecruiterSignupPage";
import RecruiterMatchingPage from "@/pages/RecruiterMatchingPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import JobSeekerMatchesPage from "@/pages/JobSeekerMatchesPage";
import JobRecommendationsPage from "@/pages/JobRecommendationsPage";
import BlogPost1 from "@/pages/BlogPost1";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminJobsPage from "@/pages/AdminJobsPage";
import AdminReferralsPage from "@/pages/AdminReferralsPage";
// import WhatsAppAnalysis from "./pages/WhatsAppAnalysis";
import NotFound from "@/pages/not-found";
import NotFoundPage from "@/pages/NotFoundPage";
import BlogDetailPage from "@/pages/BlogDetailPage";

// Job matching features coming soon - temporarily disabled

// Import tool pages
import CoverLetterPage from "@/pages/tools/CoverLetterPage";
import CVTemplatesPage from "@/pages/tools/CVTemplatesPage";
import ATSKeywordsPage from "@/pages/tools/ATSKeywordsPage";
import CoverLetterIdeasPage from "@/pages/tools/CoverLetterIdeasPage";
import CVChecklistPage from "@/pages/tools/CVChecklistPage";
import JobFitQuizPage from "@/pages/tools/JobFitQuizPage";
import InterviewGuidePage from "@/pages/tools/InterviewGuidePage";
import InterviewPracticePage from "@/pages/InterviewPracticePage";
import SkillGapAnalysisPage from "@/pages/SkillGapAnalysisPage";
import CareerPathVisualizerPage from "@/pages/CareerPathVisualizerPage";

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
import ResumeBuilder from "@/pages/ResumeBuilder";
import JobsPage from "@/pages/JobsPage";
import SkillsQuizPage from "@/pages/SkillsQuizPage";

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
                <Route path="/" component={HomePage} />
                <Route path="/how-it-works" component={HowItWorksPage} />
                <Route path="/pricing" component={PricingPage} />
                <Route path="/blog" component={SimpleBlogPage} />
                <Route path="/about" component={AboutPage} />
                <Route path="/privacy" component={PrivacyPage} />
                <Route path="/terms" component={TermsPage} />
                <Route path="/contact" component={ContactPage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/signup" component={SignUpPage} />
                <Route path="/forgot-password" component={ForgotPasswordPage} />
                <Route path="/reset-password" component={ResetPasswordPage} />
                <Route path="/auth" component={LoginPage} />
                <Route path="/auth/callback" component={AuthCallback} />
                <Route path="/realtime-ats" component={RealtimeATSPage} />
                <Route path="/referral" component={ReferralPage} />
                <Route path="/refer" component={ReferralPage} />
                <Route path="/job-sites" component={JobSitesPage} />
                <Route path="/whatsapp-upload" component={WhatsAppUploadPage} />
                <Route path="/templates" component={TemplatesPage} />
                <Route path="/jobs" component={JobsPage} />
                <Route path="/xai-test" component={XAITestPage} />
                
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
                <Route path="/interview-practice" component={InterviewPracticePage} />
                <Route path="/skill-gap-analysis" component={SkillGapAnalysisPage} />
                <Route path="/career-path-visualizer" component={CareerPathVisualizerPage} />
                <Route path="/resume-builder" component={ResumeBuilder} />
                
                {/* Job matching services coming soon - temporarily disabled */}
                
                {/* Protected routes requiring authentication */}
                <ProtectedRoute path="/dashboard" component={DashboardPage} />
                <ProtectedRoute path="/upload" component={UploadPage} />
                <ProtectedRoute path="/cv/:id" component={CVDetailsPage} />
                <ProtectedRoute path="/cv/latest" component={LatestCVPage} />
                <ProtectedRoute path="/deep-analysis" component={DeepAnalysisPage} />
                <Route path="/ats-results" component={ATSResultsPage} />
      
                <Route path="/motivation-dashboard" component={MotivationDashboard} />
                <Route path="/local-ai-demo" component={LocalAIDemoPage} />
                <Route path="/sa-ai-demo" component={SouthAfricanAIDemo} />
                <ProtectedRoute path="/profile" component={ProfilePage} />
                <ProtectedRoute path="/settings" component={SettingsPage} />
                <ProtectedRoute path="/premium-tools" component={PremiumToolsPage} />
                <Route path="/job-seeker-tools" component={JobSeekerToolsPage} />
                <ProtectedRoute path="/subscription" component={SubscriptionPage} />
                <ProtectedRoute path="/recruiter/matches" component={RecruiterMatchingPage} />
                <ProtectedRoute path="/recruiter/dashboard" component={RecruiterDashboard} />
                <ProtectedRoute path="/job-seeker/matches" component={JobSeekerMatchesPage} />
                <ProtectedRoute path="/job-recommendations" component={JobRecommendationsPage} />
                <ProtectedRoute path="/job-seeker/profile" component={JobSeekerProfile} />
                <ProtectedRoute path="/referrals" component={ReferralDashboard} />
                <ProtectedRoute path="/refer-earn" component={ReferralDashboard} />
                <Route path="/admin/login" component={AdminLogin} />
                <Route path="/admin/dashboard" component={AdminDashboard} />
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/admin/users" component={AdminUsers} />
                <Route path="/admin/jobs" component={AdminJobsPage} />
                <Route path="/admin/referrals" component={AdminReferralsPage} />
                <Route path="/skills-quiz" component={SkillsQuizPage} />
                <Route path="/404" component={NotFoundPage} />
                <Route component={NotFound} />
              </Switch>
                <EmailVerificationHandler />
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
