import TotHubLogo from "@/components/TotHubLogo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, HelpCircle, Loader2, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  // Redirect when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear any old tokens first
        localStorage.clear();

        // Store new auth data
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast({
          title: "Welcome back!",
          description: `Logged in as ${data.user.name}`,
        });

        // Navigate directly to dashboard
        setTimeout(() => {
          window.location.href = "/nursery";
        }, 500);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Password reset email sent",
          description: data.message,
        });
        setShowForgotDialog(false);
        setForgotEmail("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send reset email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotUsername = async () => {
    if (!forgotEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Username sent",
          description: data.message,
        });
        setShowForgotDialog(false);
        setForgotEmail("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send username",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nursery-bg flex items-center justify-center p-4 font-body text-nursery-dark">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center flex flex-col items-center">
          <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
            <TotHubLogo size="large" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-nursery-dark">
            Welcome Back!
          </h1>
          <p className="text-gray-500 mt-2">Sign in to your classroom</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-paper border-4 border-nursery-sage rounded-squircle bg-white overflow-hidden">
          <CardHeader className="space-y-1 bg-nursery-sage/10 border-b-2 border-nursery-sage/20 pb-6">
            <CardTitle className="text-xl font-heading font-bold text-center text-nursery-dark">
              Teacher Login
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your credentials to access TotHub
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="rounded-xl border-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="font-heading font-bold text-nursery-dark ml-1"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Enter your username"
                  className="h-12 rounded-xl border-2 border-nursery-wood focus:border-nursery-coral focus:ring-nursery-coral/20 bg-nursery-bg/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="font-heading font-bold text-nursery-dark ml-1"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    className="h-12 rounded-xl border-2 border-nursery-wood focus:border-nursery-coral focus:ring-nursery-coral/20 bg-nursery-bg/50 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1 h-10 w-10 p-0 hover:bg-transparent text-nursery-dark/50 hover:text-nursery-dark"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-nursery-coral hover:bg-nursery-coral/90 text-white font-heading font-bold text-lg rounded-squircle shadow-paper hover:shadow-paper-hover hover:-translate-y-0.5 transition-all border-2 border-nursery-dark mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Forgot Username/Password Link */}
              <div className="text-center pt-2">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-nursery-dark/70 hover:text-nursery-coral font-bold"
                  onClick={() => setShowForgotDialog(true)}
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Forgot your username or password?
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="text-center text-sm text-gray-400 font-heading">
          <p>Need help? Ask your director!</p>
        </div>
      </div>

      {/* Forgot Username/Password Dialog */}
      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="sm:max-w-md bg-white rounded-squircle border-4 border-nursery-dark shadow-paper">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl text-nursery-dark">
              Account Recovery
            </DialogTitle>
            <DialogDescription className="font-body">
              We'll help you recover your account. Enter your email address
              below.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-nursery-bg p-1 rounded-xl border-2 border-nursery-wood/20">
              <TabsTrigger
                value="password"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-nursery-coral data-[state=active]:shadow-sm font-heading font-bold"
              >
                Reset Password
              </TabsTrigger>
              <TabsTrigger
                value="username"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-nursery-coral data-[state=active]:shadow-sm font-heading font-bold"
              >
                Recover Username
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label
                  htmlFor="forgot-email-password"
                  className="font-heading font-bold text-nursery-dark"
                >
                  Email Address
                </Label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-nursery-sage" />
                  <Input
                    id="forgot-email-password"
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="flex-1 rounded-xl border-2 border-nursery-wood focus:border-nursery-coral"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 italic">
                We'll send you a link to reset your password.
              </p>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotDialog(false)}
                  className="rounded-xl border-2 border-nursery-dark font-heading font-bold hover:bg-nursery-wood/20"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  className="bg-nursery-coral text-white rounded-xl border-2 border-nursery-dark shadow-sm hover:shadow-md font-heading font-bold"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="username" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label
                  htmlFor="forgot-email-username"
                  className="font-heading font-bold text-nursery-dark"
                >
                  Email Address
                </Label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-nursery-sage" />
                  <Input
                    id="forgot-email-username"
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="flex-1 rounded-xl border-2 border-nursery-wood focus:border-nursery-coral"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 italic">
                We'll send your username to your registered email address.
              </p>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotDialog(false)}
                  className="rounded-xl border-2 border-nursery-dark font-heading font-bold hover:bg-nursery-wood/20"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleForgotUsername}
                  disabled={forgotLoading}
                  className="bg-nursery-coral text-white rounded-xl border-2 border-nursery-dark shadow-sm hover:shadow-md font-heading font-bold"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Username"
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
