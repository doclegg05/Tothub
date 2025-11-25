const testimonials = [
  {
    content:
      "TotHub has completely transformed how we manage our daycare. The biometric check-in is a game-changer for parent peace of mind.",
    author: "Sarah Jenkins",
    role: "Director, Little Stars Academy",
    image: "/avatars/sarah.png",
  },
  {
    content:
      "The compliance tracking features save me hours of paperwork every week. I can finally focus on the children instead of the forms.",
    author: "Michael Chen",
    role: "Owner, Bright Beginnings",
    image: "/avatars/michael.png",
  },
  {
    content:
      "Parents love the real-time updates. It's built so much trust with our families. The interface is beautiful and easy to use.",
    author: "Emily Rodriguez",
    role: "Center Manager, Sunshine Kids",
    image: "/avatars/emily.png",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase text-sm">
            Testimonials
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by daycare providers everywhere
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-surface rounded-card p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200"
            >
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {testimonial.author[0]}
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic leading-relaxed">
                &quot;{testimonial.content}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
