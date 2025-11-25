import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for home-based daycares just getting started.",
    features: [
      "Up to 10 children",
      "Basic attendance",
      "Parent communication",
      "Digital daily reports",
    ],
    cta: "Start for Free",
    href: "/register",
    featured: false,
  },
  {
    name: "Professional",
    price: "$49",
    period: "/month",
    description: "Everything you need for a growing center.",
    features: [
      "Up to 50 children",
      "Biometric check-in",
      "Staff scheduling",
      "Billing & invoicing",
      "Compliance tracking",
    ],
    cta: "Start Free Trial",
    href: "/register?plan=pro",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Advanced control for multi-location centers.",
    features: [
      "Unlimited children",
      "Multi-site management",
      "API access",
      "Dedicated support",
      "Custom training",
    ],
    cta: "Contact Sales",
    href: "/contact",
    featured: false,
  },
];

export default function PricingPreview() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase text-sm">
            Pricing
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
            Simple, transparent pricing
          </p>
          <p className="mt-4 text-lg text-stone-500 max-w-2xl mx-auto">
            Choose the plan that fits your center&apos;s needs. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-card p-8 border ${
                plan.featured
                  ? "border-primary shadow-soft-lg bg-canvas ring-1 ring-primary"
                  : "border-stone-200 bg-surface shadow-soft-sm hover:shadow-soft-md"
              } transition-all duration-300 flex flex-col`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 -mt-4 mr-4 px-4 py-1 bg-secondary text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-sm">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-stone-800">
                  {plan.name}
                </h3>
                <p className="mt-2 text-stone-500 text-sm">
                  {plan.description}
                </p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-stone-800">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-stone-500">{plan.period}</span>
                )}
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-primary shrink-0 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-stone-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-button transition-colors ${
                  plan.featured
                    ? "bg-primary text-white hover:bg-primary-600"
                    : "bg-stone-100 text-stone-800 hover:bg-stone-200"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/pricing"
            className="text-primary font-medium hover:text-primary-600 flex items-center justify-center"
          >
            View full pricing details
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
