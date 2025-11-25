export default function FAQ() {
  const faqs = [
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use enterprise-grade encryption (AES-256) for all data at rest and TLS 1.3 for data in transit. We are fully compliant with COPPA, FERPA, and HIPAA regulations.",
    },
    {
      question: "Can I try it before I buy?",
      answer:
        "Yes! We offer a 14-day free trial on our Professional plan, and we also have a completely free Starter plan for small centers.",
    },
    {
      question: "Does it work on mobile devices?",
      answer:
        "TotHub is fully responsive and works great on all devices - desktops, tablets, and smartphones. We also have dedicated mobile apps coming soon.",
    },
    {
      question: "How does the biometric check-in work?",
      answer:
        "We use secure facial recognition or fingerprint scanning to verify authorized guardians. No raw images are stored - only encrypted mathematical templates that cannot be reverse-engineered.",
    },
  ];

  return (
    <section className="py-24 bg-canvas">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase text-sm">
            FAQ
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
            Frequently Asked Questions
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-surface rounded-card shadow-soft-sm border border-stone-200 overflow-hidden"
            >
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-stone-800 hover:bg-stone-50 transition-colors">
                <span>{faq.question}</span>
                <span className="transition group-open:rotate-180">
                  <svg
                    fill="none"
                    height="24"
                    shapeRendering="geometricPrecision"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path d="M6 9l6 6 6-6"></path>
                  </svg>
                </span>
              </summary>
              <div className="text-stone-600 px-6 pb-6 pt-0 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
