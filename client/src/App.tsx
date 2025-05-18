import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import CVImprovementDemo from "@/pages/CVImprovementDemo";
import CVImprovementPage from "@/pages/CVImprovementPage";
import BlogPage from "@/pages/BlogPage";
import AuthPage from "@/pages/AuthPage";
import PricingPage from "@/pages/PricingPage";
import ContactPage from "@/pages/ContactPage";
import { AuthProvider } from "@/hooks/use-auth";

// Create a client
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/cv-improvement" component={CVImprovementPage} />
              <Route path="/analyzer" component={CVImprovementDemo} />
              <Route path="/blog" component={BlogPage} />
              <Route path="/auth" component={AuthPage} />
              <Route path="/pricing" component={PricingPage} />
              <Route path="/contact" component={ContactPage} />
            </Switch>
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}