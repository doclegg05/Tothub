import TotHubLogo from "@/components/TotHubLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Clock,
  CreditCard,
  Heart,
  MessageCircle,
  Play,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function LandingPage() {
  const { toast } = useToast();
  const [showDemo, setShowDemo] = useState(false);

  const features = [
    {
      icon: Clock,
      title: "Save Time Daily",
      description:
        "Automate attendance tracking and eliminate paper sign-in sheets with digital check-in/out",
    },
    {
      icon: CreditCard,
      title: "Simplified Billing",
      description:
        "QuickBooks-ready integration with automated invoicing and payment tracking",
    },
    {
      icon: Users,
      title: "Parent Engagement",
      description:
        "Real-time updates, photos, and messaging keep families connected throughout the day",
    },
    {
      icon: Shield,
      title: "Stay Compliant",
      description:
        "50-state compliance with automatic ratio monitoring and audit-ready reporting",
    },
  ];

  const handleRoleSelect = (role: string) => {
    toast({
      title: "Demo Started",
      description: `Viewing TotHub as ${role}. Explore all features!`,
    });
    setTimeout(() => {
      setShowDemo(false);
      window.location.href = "/nursery"; // Direct to the new dashboard design
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-nursery-bg font-body text-nursery-dark">
      {/* Navigation */}
      <nav className="bg-nursery-bg/80 backdrop-blur-md sticky top-0 z-50 border-b-2 border-nursery-wood/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="cursor-pointer hover:scale-105 transition-transform">
                  <TotHubLogo size="medium" />
                </div>
              </Link>
              <div className="hidden md:flex space-x-8 font-heading font-bold text-lg">
                <a
                  href="#features"
                  className="text-nursery-dark hover:text-nursery-coral transition-colors"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-nursery-dark hover:text-nursery-coral transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#resources"
                  className="text-nursery-dark hover:text-nursery-coral transition-colors"
                >
                  Resources
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="font-heading font-bold text-nursery-dark hover:bg-nursery-wood/20 hover:text-nursery-dark"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-nursery-coral text-white font-heading font-bold rounded-squircle shadow-paper hover:shadow-paper-hover hover:-translate-y-0.5 transition-all border-2 border-nursery-dark">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-heading font-bold mb-6 bg-nursery-sky/30 text-nursery-dark border-2 border-nursery-sky">
                Trusted by 5,000+ Daycare Centers
              </div>
              <h1 className="text-5xl lg:text-7xl font-heading font-bold text-nursery-dark mb-6 leading-tight">
                More Time for <span className="text-nursery-coral">Hugs</span>,
                Less Time for Paperwork.
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Simplify billing, attendance, and parent communication with our
                intuitive platform designed for modern childcare.
              </p>

              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-nursery-coral text-white font-heading font-bold rounded-squircle shadow-paper hover:shadow-paper-hover hover:-translate-y-0.5 transition-all border-2 border-nursery-dark text-lg h-14 px-8"
                  onClick={() => setShowDemo(true)}
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  See How It Works
                </Button>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-nursery-dark text-nursery-dark font-heading font-bold rounded-squircle hover:bg-nursery-wood/20 text-lg h-14 px-8"
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </div>

              <div className="items-center space-x-6 bg-white/50 p-4 rounded-xl border-2 border-nursery-wood/20 inline-flex">
                <div className="flex items-center">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-6 h-6 fill-nursery-yellow text-nursery-dark"
                      />
                    ))}
                  </div>
                  <span className="ml-3 font-heading font-bold text-nursery-dark">
                    4.9/5
                  </span>
                </div>
                <div className="h-8 w-0.5 bg-nursery-dark/10"></div>
                <div className="text-sm font-heading font-bold text-gray-600">
                  10,000+ Happy Teachers
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-nursery-wood/30 rounded-[40px] transform rotate-3 border-2 border-nursery-wood"></div>
              <Card className="relative shadow-xl rounded-[40px] overflow-hidden border-4 border-nursery-dark bg-white">
                <img
                  src="/dashboard-mockup.svg"
                  alt="TotHub Dashboard"
                  className="w-full h-auto"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.currentTarget.src =
                      "https://placehold.co/600x400/FDFBF7/4A4A68?text=TotHub+Dashboard";
                  }}
                />

                {/* Floating Elements */}
                <div className="absolute -bottom-6 -right-6 bg-nursery-yellow p-6 rounded-full border-4 border-nursery-dark shadow-paper transform -rotate-12 hidden lg:block">
                  <Heart className="w-12 h-12 text-nursery-coral fill-nursery-coral animate-pulse" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="py-24 bg-white border-y-2 border-nursery-wood/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-nursery-dark mb-6">
              Everything You Need to Run Your Daycare
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From attendance tracking to billing, we've got you covered with
              powerful features wrapped in a friendly interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group hover:-translate-y-2 transition-all duration-300 border-4 border-nursery-sage rounded-squircle shadow-paper hover:shadow-lg bg-white overflow-hidden"
                >
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-nursery-sage/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border-2 border-nursery-sage">
                      <Icon className="w-8 h-8 text-nursery-dark" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-nursery-dark mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-nursery-dark text-nursery-bg relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-nursery-yellow rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-nursery-coral rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Active Centers", value: "5,000+" },
              { label: "Children Managed", value: "250k+" },
              { label: "Uptime", value: "99.9%" },
              { label: "Support", value: "24/7" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white/5 border-2 border-white/10 backdrop-blur-sm"
              >
                <div className="text-5xl font-heading font-bold mb-2 text-nursery-yellow">
                  {stat.value}
                </div>
                <div className="text-nursery-bg/80 font-heading text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-nursery-wood/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-nursery-dark mb-6">
            Ready to Transform Your Daycare?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of daycare centers already using TotHub to save time
            and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-nursery-coral text-white font-heading font-bold rounded-squircle shadow-paper hover:shadow-paper-hover hover:-translate-y-0.5 transition-all border-2 border-nursery-dark text-xl h-16 px-10"
              >
                Start 30-Day Free Trial
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowDemo(true)}
              className="bg-white border-2 border-nursery-dark text-nursery-dark font-heading font-bold rounded-squircle hover:bg-white/80 text-xl h-16 px-10 shadow-sm"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-nursery-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-nursery-bg border-4 border-nursery-dark rounded-squircle shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <TotHubLogo size="medium" />
                <h3 className="text-2xl font-heading font-bold mt-6 text-nursery-dark">
                  Welcome to TotHub!
                </h3>
                <p className="text-gray-600 mt-2">
                  Who are you exploring as today?
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start h-14 text-lg font-heading font-bold border-2 border-nursery-sage hover:bg-nursery-sage/20 rounded-xl"
                  onClick={() => handleRoleSelect("admin")}
                >
                  <Users className="w-6 h-6 mr-4 text-nursery-dark" />
                  I'm an Admin / Director
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-14 text-lg font-heading font-bold border-2 border-nursery-sky hover:bg-nursery-sky/20 rounded-xl"
                  onClick={() => handleRoleSelect("staff")}
                >
                  <Heart className="w-6 h-6 mr-4 text-nursery-coral" />
                  I'm a Teacher
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-14 text-lg font-heading font-bold border-2 border-nursery-wood hover:bg-nursery-wood/20 rounded-xl"
                  onClick={() => handleRoleSelect("parent")}
                >
                  <MessageCircle className="w-6 h-6 mr-4 text-nursery-dark" />
                  I'm a Parent
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full mt-6 text-gray-500 hover:text-nursery-dark font-heading font-bold"
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
