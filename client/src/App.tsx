import { ChatbotNew } from "@/components/chatbot-new";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AlertRules from "@/pages/alert-rules";
import Analytics from "@/pages/analytics";
import AuthReceiver from "@/pages/auth-receiver";
import BackgroundJobs from "@/pages/background-jobs";
import Billing from "@/pages/billing";
import CheckIn from "@/pages/checkin";
import ChildDetails from "@/pages/child-details";
import Children from "@/pages/children";
import Compliance from "@/pages/compliance";
import DailyReports from "@/pages/daily-reports";
import Dashboard from "@/pages/dashboard";
import DashboardNursery from "@/pages/dashboard-nursery";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import ParentCommunication from "@/pages/parent-communication";
import ParentLogin from "@/pages/parent-login";
import ParentPortal from "@/pages/parent-portal";
import Payment from "@/pages/payment";
import PaymentSuccess from "@/pages/payment-success";
import Payroll from "@/pages/payroll";
import PerformanceMonitor from "@/pages/performance-monitor";
import PerformanceTest from "@/pages/performance-test";
import Reports from "@/pages/reports";
import Scheduling from "@/pages/scheduling";
import Security from "@/pages/security";
import Sessions from "@/pages/sessions";
import Settings from "@/pages/settings";
import Staff from "@/pages/staff";
import { StaffSchedulingDayPilot } from "@/pages/staff-scheduling-daypilot";
import UserProfile from "@/pages/user-profile";
import WorkflowVisualization from "@/pages/workflow-visualization";
import ZapierIntegration from "@/pages/zapier-integration";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";
import { AuthProvider, useAuth } from "./lib/auth";
import { queryClient } from "./lib/queryClient";

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
          <Route path="/daily-reports" component={DailyReports} />
          <Route path="/children" component={Children} />
          <Route path="/children/:id" component={ChildDetails} />
          <Route path="/staff" component={Staff} />
          <Route path="/staff-scheduling" component={StaffSchedulingDayPilot} />
          <Route path="/payroll" component={Payroll} />
          <Route path="/scheduling" component={Scheduling} />
          <Route path="/reports" component={Reports} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/settings" component={Settings} />
          <Route path="/security" component={Security} />
          <Route path="/compliance" component={Compliance} />
          <Route path="/performance-test" component={PerformanceTest} />
          <Route path="/performance-monitor" component={PerformanceMonitor} />
          <Route path="/background-jobs" component={BackgroundJobs} />
          <Route path="/alert-rules" component={AlertRules} />
          <Route
            path="/workflow-visualization"
            component={WorkflowVisualization}
          />
          <Route path="/sessions" component={Sessions} />
          <Route path="/profile" component={UserProfile} />
          <Route path="/payment" component={Payment} />
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/billing" component={Billing} />
          <Route path="/zapier" component={ZapierIntegration} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <ChatbotNew />
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [location] = useLocation();

  // Special route for design preview
  if (location === "/nursery") {
    return <DashboardNursery />;
  }

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
        <Route path="/login" component={Login} />
        <Route path="/parent-login" component={ParentLogin} />
        <Route path="/auth-receiver" component={AuthReceiver} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Parent users get a different experience
  if (user?.role === "parent") {
    return (
      <div className="min-h-screen bg-gray-50">
        <ParentPortal />
      </div>
    );
  }

  return <AuthenticatedApp />;
}

import React from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-700 mb-4">
              The application crashed with the following error:
            </p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mb-4 text-red-800">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
