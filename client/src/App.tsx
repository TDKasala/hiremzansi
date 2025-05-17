import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import CVImprovementDemo from "./pages/CVImprovementDemo";

// Create a client
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={CVImprovementDemo} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}