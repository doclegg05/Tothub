import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, HelpCircle, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  // Redirect when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear any old tokens first
        localStorage.clear();
        
        // Store new auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({ 
          title: 'Welcome back!', 
          description: `Logged in as ${data.user.name}` 
        });
        
        // Navigate directly to dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        variant: 'destructive'
      });
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Password reset email sent',
          description: data.message,
        });
        setShowForgotDialog(false);
        setForgotEmail('');
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to send reset email',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotUsername = async () => {
    if (!forgotEmail) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        variant: 'destructive'
      });
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Username sent',
          description: data.message,
        });
        setShowForgotDialog(false);
        setForgotEmail('');
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to send username',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex flex-col items-center mb-6">
            <img 
              src="/tothub-logo-new.png" 
              alt="TotHub Logo" 
              className="w-20 h-20 object-contain mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-900">TotHub</h1>
            <p className="text-sm text-gray-600">Daycare Management System</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your daycare management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username"
                  className="h-11"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="h-11 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Forgot Username/Password Link */}
              <div className="text-center pt-2">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-800"
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
        <div className="text-center text-sm text-gray-500">
          <p>Need additional help? Contact your system administrator</p>
        </div>
      </div>

      {/* Forgot Username/Password Dialog */}
      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account Recovery</DialogTitle>
            <DialogDescription>
              We'll help you recover your account. Enter your email address below.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Reset Password</TabsTrigger>
              <TabsTrigger value="username">Recover Username</TabsTrigger>
            </TabsList>
            
            <TabsContent value="password" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email-password">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <Input
                    id="forgot-email-password"
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                We'll send you a link to reset your password.
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="username" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email-username">Email Address</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <Input
                    id="forgot-email-username"
                    type="email"
                    placeholder="Enter your email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                We'll send your username to your registered email address.
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleForgotUsername}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Username'
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