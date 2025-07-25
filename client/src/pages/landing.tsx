import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  CreditCard, 
  Shield, 
  BarChart3, 
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  MessageCircle,
  Clock,
  Zap,
  Heart
} from "lucide-react";

export default function LandingPage() {
  const { toast } = useToast();
  const [showDemo, setShowDemo] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const features = [
    {
      icon: Clock,
      title: "Save Time Daily",
      description: "Automate attendance tracking and eliminate paper sign-in sheets with digital check-in/out"
    },
    {
      icon: CreditCard,
      title: "Simplified Billing",
      description: "QuickBooks-ready integration with automated invoicing and payment tracking"
    },
    {
      icon: Users,
      title: "Parent Engagement",
      description: "Real-time updates, photos, and messaging keep families connected throughout the day"
    },
    {
      icon: Shield,
      title: "Stay Compliant",
      description: "50-state compliance with automatic ratio monitoring and audit-ready reporting"
    }
  ];

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    toast({
      title: "Demo Started",
      description: `Viewing TotHub as ${role}. Explore all features!`,
    });
    setTimeout(() => {
      setShowDemo(false);
      window.location.href = "/";
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <img 
                  src="/tothub-logo.jpg" 
                  alt="TotHub Logo" 
                  className="w-8 h-8 object-contain"
                />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  TotHub
                </h1>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Features</a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition">Pricing</a>
                <a href="#resources" className="text-gray-700 hover:text-blue-600 transition">Resources</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold mb-4 bg-blue-100 text-blue-700">
                Trusted by 5,000+ Daycare Centers
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                #1 Daycare Management Software
              </h1>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-lg">Get paid faster with automated billing</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-lg">Ensure compliance with smart ratio monitoring</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-lg">Delight parents with real-time updates</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-8">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => setShowDemo(true)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  See How It Works
                </Button>
                <Link href="/">
                  <Button size="lg" variant="outline">
                    Start Free Trial
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">4.9/5</span>
                </div>
                <div className="text-sm text-gray-600">
                  10,000+ Reviews
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 rounded-3xl transform rotate-6"></div>
              <Card className="relative shadow-2xl rounded-3xl overflow-hidden">
                <img 
                  src="/dashboard-mockup.svg" 
                  alt="TotHub Dashboard"
                  className="w-full h-auto"
                />
                <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Live Demo Available</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Daycare
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From attendance tracking to billing, we've got you covered with powerful features designed for busy daycare centers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100">Active Centers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">250,000+</div>
              <div className="text-blue-100">Children Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Daycare?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of daycare centers already using KidSign Pro to save time and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Start 30-Day Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" onClick={() => setShowDemo(true)}>
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">See how KidSign Pro works!</h3>
              <p className="text-gray-600 mb-6">First, tell us about yourself:</p>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleRoleSelect("admin")}
                >
                  <Users className="w-5 h-5 mr-3 text-blue-600" />
                  I'm an admin or director
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleRoleSelect("staff")}
                >
                  <Heart className="w-5 h-5 mr-3 text-green-600" />
                  I'm a staff member
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleRoleSelect("parent")}
                >
                  <MessageCircle className="w-5 h-5 mr-3 text-purple-600" />
                  I'm a parent or guardian
                </Button>
              </div>
              
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => setShowDemo(false)}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}