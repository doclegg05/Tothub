import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, ProtectedRoute } from "./lib/auth";
import { Sidebar } from "@/components/sidebar";
import { ChatbotNew } from "@/components/chatbot-new";
import Dashboard from "@/pages/dashboard";
import CheckIn from "@/pages/checkin";
import Children from "@/pages/children";
import Staff from "@/pages/staff";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import PerformanceTest from "@/pages/performance-test";
import Security from "@/pages/security";
import Compliance from "@/pages/compliance";
import ParentCommunication from "@/pages/parent-communication";
import Payroll from "@/pages/payroll";
import Scheduling from "@/pages/scheduling";
import Sessions from "@/pages/sessions";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import Profile from "@/pages/profile";
import ParentPortal from "@/pages/parent-portal";
import ParentLogin from "@/pages/parent-login";

function AuthenticatedApp() {
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
          <Route path="/scheduling" component={Scheduling} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route path="/security" component={Security} />
          <Route path="/compliance" component={Compliance} />
          <Route path="/performance-test" component={PerformanceTest} />
          <Route path="/sessions" component={Sessions} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <ChatbotNew />
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading TotHub...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/landing" component={Landing} />
        <Route path="/parent-login" component={ParentLogin} />
        <Route component={Login} />
      </Switch>
    );
  }

  // Parent users get a different experience
  if (user?.role === 'parent') {
    return (
      <div className="min-h-screen bg-gray-50">
        <ParentPortal />
      </div>
    );
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
