import { Button } from "@tothub/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tothub/ui/card";
import Link from "next/link";

export default function FeaturesPage() {
  const features = [
    {
      title: "Biometric Authentication",
      description:
        "Ensure the highest level of security with fingerprint and facial recognition for check-ins and check-outs. Only authorized guardians can pick up children.",
      icon: "🔐",
    },
    {
      title: "Compliance Tracking",
      description:
        "Automatically track ratios, staff certifications, and immunization records. Get alerts before you fall out of compliance with state regulations.",
      icon: "✅",
    },
    {
      title: "Real-time Monitoring",
      description:
        "Keep track of attendance, meals, naps, and activities in real-time. Staff can easily log updates from tablets or mobile devices.",
      icon: "📊",
    },
    {
      title: "Analytics & Reporting",
      description:
        "Gain deep insights into your business performance. View enrollment trends, revenue reports, and staff attendance at a glance.",
      icon: "📈",
    },
    {
      title: "Multi-location Support",
      description:
        "Manage multiple centers from a single dashboard. Standardize policies and view aggregated data across all your locations.",
      icon: "🏢",
    },
    {
      title: "Parent Engagement",
      description:
        "Keep parents connected with a dedicated mobile app. Share photos, daily reports, and messages securely and instantly.",
      icon: "📱",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary-50 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="block text-primary-600">Modern Daycares</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Everything you need to manage your center, ensure safety, and
            delight parents—all in one platform.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="primary" size="lg">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="outlined"
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo/Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See TotHub in Action
            </h2>
            <p className="text-lg text-gray-600">
              Experience the intuitive interface designed for busy directors and
              teachers.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 aspect-video flex items-center justify-center max-w-5xl mx-auto">
            <div className="text-center">
              <span className="text-6xl block mb-4">🖥️</span>
              <p className="text-gray-500 font-medium">
                Interactive Dashboard Preview
              </p>
              <p className="text-sm text-gray-400">(Coming Soon)</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Upgrade Your Center?
          </h2>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Join thousands of childcare providers who trust TotHub.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/pricing">
              <Button
                variant="default"
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                View Pricing
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-primary-700"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
