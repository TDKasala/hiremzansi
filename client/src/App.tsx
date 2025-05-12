import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
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
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <TooltipProvider>
          <AuthProvider>
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
                <ProtectedRoute path="/dashboard" component={DashboardPage} />
                <ProtectedRoute path="/upload" component={UploadPage} />
                <ProtectedRoute path="/cv/:id" component={CVDetailsPage} />
                <ProtectedRoute path="/premium-tools" component={PremiumToolsPage} />
                <Route component={NotFound} />
              </Switch>
            </Layout>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
