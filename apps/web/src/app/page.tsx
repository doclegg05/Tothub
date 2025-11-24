import { Button } from "@tothub/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tothub/ui/card";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      title: "Biometric Authentication",
      description:
        "Secure check-ins with fingerprint and facial recognition for enhanced safety.",
      icon: "🔐",
    },
    {
      title: "Compliance Tracking",
      description:
        "Stay compliant with state regulations and licensing requirements automatically.",
      icon: "✅",
    },
    {
      title: "Real-time Monitoring",
      description:
        "Live attendance tracking and instant notifications for parents and staff.",
      icon: "📊",
    },
    {
      title: "Analytics & Reporting",
      description:
        "Comprehensive insights into daycare operations and performance metrics.",
      icon: "📈",
    },
    {
      title: "Multi-location Support",
      description:
        "Manage multiple daycare centers from one centralized platform.",
      icon: "🏢",
    },
    {
      title: "Mobile Responsive",
      description:
        "Access from any device, anywhere - desktop, tablet, or mobile.",
      icon: "📱",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Modern Daycare Management
              <span className="block text-primary-600">Made Simple</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
              Streamline operations, ensure compliance, and provide peace of
              mind with our comprehensive daycare management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                Get Started Free
              </Button>
              <Button variant="outline" size="lg">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Daycare
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for daycare providers, all
              in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="outlined"
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/features">
              <Button variant="outline" size="lg">
                View All Features →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Transform Your Daycare?
            </h2>
            <p className="text-xl text-primary-100">
              Join hundreds of daycare providers who trust TotHub to manage
              their operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="default"
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-primary-700"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Integration Demo (keeping from original) */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card variant="elevated" className="text-center">
              <CardHeader>
                <CardTitle>Monorepo Architecture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  This site is built with a modern monorepo architecture using
                  Turborepo, Next.js 15, and shared workspace packages.
                </p>
                <p className="text-sm text-gray-500">
                  Components from{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    @tothub/ui
                  </code>{" "}
                  are seamlessly integrated across the application.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="primary" size="md">
                    Primary Button
                  </Button>
                  <Button variant="outline" size="md">
                    Outline Button
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
