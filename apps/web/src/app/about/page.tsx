import { Button } from "@tothub/ui/button";
import { Card, CardContent } from "@tothub/ui/card";
import Link from "next/link";

export default function AboutPage() {
  const values = [
    {
      title: "Safety First",
      description:
        "We prioritize the security and well-being of children above all else, implementing top-tier biometric authentication.",
      icon: "🛡️",
    },
    {
      title: "Simplicity",
      description:
        "We believe powerful software should be easy to use. Our intuitive design ensures staff can focus on care, not admin.",
      icon: "✨",
    },
    {
      title: "Transparency",
      description:
        "Building trust between providers and parents through real-time updates and open communication channels.",
      icon: "🤝",
    },
    {
      title: "Innovation",
      description:
        "Constantly evolving our platform with the latest technology to meet the changing needs of modern childcare.",
      icon: "💡",
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "Former daycare director with 15 years of experience in early childhood education.",
      image: "👩‍💼",
    },
    {
      name: "David Chen",
      role: "CTO",
      bio: "Tech veteran passionate about using AI to solve real-world problems in education.",
      image: "👨‍💻",
    },
    {
      name: "Maria Rodriguez",
      role: "Head of Product",
      bio: "Dedicated to creating user-centric designs that make life easier for teachers.",
      image: "👩‍🎨",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary-50 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Empowering Childcare Providers to
              <span className="block text-primary-600">
                Focus on What Matters
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Our mission is to streamline daycare management so you can
              dedicate more time to nurturing the next generation.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
              <p className="text-lg text-gray-600">
                TotHub was born out of frustration. As daycare directors and
                parents, we struggled with outdated paper forms, disconnected
                systems, and the constant worry about security.
              </p>
              <p className="text-lg text-gray-600">
                We knew there had to be a better way. We set out to build a
                platform that combines bank-grade security with the ease of use
                of your favorite consumer apps.
              </p>
              <p className="text-lg text-gray-600">
                Today, TotHub helps hundreds of centers manage their operations
                efficiently, keeping thousands of children safe and parents
                connected.
              </p>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8 h-80 flex items-center justify-center">
              <span className="text-6xl">📖</span>
              {/* Placeholder for story image */}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide every decision we make at TotHub.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                variant="outlined"
                className="bg-white border-none shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate individuals working behind the scenes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto flex items-center justify-center text-4xl">
                  {member.image}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium">{member.role}</p>
                </div>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-20 text-white">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Join Us on Our Mission
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the future of daycare management today.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/contact">
              <Button variant="primary" size="lg">
                Get in Touch
              </Button>
            </Link>
            <Link href="/careers">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white/10"
              >
                View Careers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
