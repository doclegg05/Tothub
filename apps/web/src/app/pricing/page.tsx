import { Button } from "@tothub/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tothub/ui/card";
import Link from "next/link";

export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "$49",
      description: "Perfect for small home-based daycares.",
      features: [
        "Up to 20 children",
        "Digital check-in/out",
        "Daily reports for parents",
        "Basic attendance tracking",
        "Email support",
      ],
      cta: "Start Free Trial",
      variant: "outlined" as const,
    },
    {
      name: "Professional",
      price: "$99",
      description: "Ideal for growing centers and preschools.",
      features: [
        "Up to 100 children",
        "Everything in Starter",
        "Biometric authentication",
        "Staff management",
        "Billing & invoicing",
        "Priority support",
      ],
      cta: "Start Free Trial",
      variant: "elevated" as const,
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For multi-location centers and franchises.",
      features: [
        "Unlimited children",
        "Everything in Professional",
        "Multi-site management",
        "Custom reporting",
        "API access",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
      variant: "outlined" as const,
    },
  ];

  const faqs = [
    {
      question: "Is there a setup fee?",
      answer:
        "No, there are no setup fees. You can start your 14-day free trial immediately without entering a credit card.",
    },
    {
      question: "Can I change plans later?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
    },
    {
      question: "Do you offer discounts for non-profits?",
      answer:
        "Yes! We offer a 20% discount for non-profit organizations. Please contact our sales team for more information.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use bank-level encryption to protect your data and comply with all major privacy regulations.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary-50 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your center's needs. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier, index) => (
              <Card
                key={index}
                variant={tier.variant}
                className={`relative flex flex-col ${
                  tier.popular
                    ? "border-primary-600 ring-2 ring-primary-600 ring-opacity-50"
                    : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {tier.name}
                  </CardTitle>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {tier.price}
                    <span className="text-base font-normal text-gray-500">
                      /month
                    </span>
                  </div>
                  <p className="text-gray-600">{tier.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-4 mb-8 flex-1">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={tier.popular ? "primary" : "outline"}
                    size="lg"
                    className="w-full"
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="max-w-3xl mx-auto grid gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-20 text-white">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Still have questions?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Our team is happy to help you find the right plan for your center.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/contact">
              <Button variant="primary" size="lg">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
