import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import { Chatbot } from "@/components/chatbot";
import Dashboard from "@/pages/dashboard";
import CheckIn from "@/pages/checkin";
import Children from "@/pages/children";
import Staff from "@/pages/staff";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import PerformanceTest from "@/pages/performance-test";
import Security from "@/pages/security";
import ParentCommunication from "@/pages/parent-communication";
import Payroll from "@/pages/payroll";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/landing" component={Landing} />
          <Route path="/checkin" component={CheckIn} />
          <Route path="/parent-communication" component={ParentCommunication} />
          <Route path="/children" component={Children} />
          <Route path="/staff" component={Staff} />
          <Route path="/payroll" component={Payroll} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route path="/security" component={Security} />
          <Route path="/performance-test" component={PerformanceTest} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
