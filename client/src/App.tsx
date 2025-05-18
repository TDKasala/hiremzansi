import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import CVImprovementDemo from "@/pages/CVImprovementDemo";
import CVImprovementPage from "@/pages/CVImprovementPage";
import BlogPage from "@/pages/BlogPage";

// Create a client
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/cv-improvement" component={CVImprovementPage} />
            <Route path="/analyzer" component={CVImprovementDemo} />
            <Route path="/blog" component={BlogPage} />
          </Switch>
        </main>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}