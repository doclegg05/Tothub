import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

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
        // Store auth token
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({ 
          title: 'Welcome back!', 
          description: `Logged in as ${data.user.name}` 
        });
        
        setLocation('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: 'director' | 'teacher' | 'staff') => {
    const users = {
      director: { username: 'director', password: 'director123', name: 'Sarah Johnson (Director)' },
      teacher: { username: 'teacher', password: 'teacher123', name: 'Maria Garcia (Teacher)' },
      staff: { username: 'staff', password: 'staff123', name: 'John Smith (Staff)' }
    };
    
    setFormData(users[role]);
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
            <p className="text-sm text-gray-600">Daycare Management</p>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600">Sign in to manage your daycare</p>
        </div>

        {/* Quick Login Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Login (Demo)</CardTitle>
            <CardDescription>
              Choose your role to quickly access the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 justify-start"
              onClick={() => handleQuickLogin('director')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Director Login</div>
                  <div className="text-sm text-gray-500">Full system access</div>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 justify-start"
              onClick={() => handleQuickLogin('teacher')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Teacher Login</div>
                  <div className="text-sm text-gray-500">Classroom management</div>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 justify-start"
              onClick={() => handleQuickLogin('staff')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Staff Login</div>
                  <div className="text-sm text-gray-500">Basic operations</div>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Manual Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Manual Login</CardTitle>
            <CardDescription>
              Enter your credentials to sign in
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
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help? Contact your system administrator</p>
          <p className="mt-1">
            Demo accounts: director/admin123, teacher/teacher123, staff/staff123
          </p>
        </div>
      </div>
    </div>
  );
}