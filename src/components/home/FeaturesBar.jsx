import { useScrollReveal } from "../../hooks/useScrollReveal";

const features = [
  {
    step: "01",
    tag: "Complimentary",
    title: "Free Express Shipping",
    description: "Complimentary priority 2-day express shipping on every order over $150. Tracked in real time.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    step: "02",
    tag: "100% Genuine",
    title: "Authenticity Guaranteed",
    description: "Every item is verified and authenticated by our luxury craft specialists before dispatch.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    step: "03",
    tag: "No Questions",
    title: "Hassle-Free 30-Day Returns",
    description: "Try at home. If you're not completely in love, return within 30 days for a prompt, full refund.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    step: "04",
    tag: "Dedicated Concierge",
    title: "24/7 Premium Support",
    description: "Our dedicated lifestyle advisors are here around the clock to assist you via chat, phone, or email.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default function FeaturesBar() {
  const [ref, isVisible] = useScrollReveal(0.15);

  return (
    <section
      ref={ref}
      id="features-bar"
      className="relative py-16 sm:py-20 bg-[#08080d] border-y border-white/5 overflow-hidden w-full max-w-full"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative p-7 rounded-3xl bg-[#0f0f18]/70 border border-white/[0.06] hover:bg-[#141422] hover:border-amber-400/25 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/5 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Header with step number and tag */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-400/20 group-hover:border-amber-400/40 transition-all duration-300">
                  {feature.icon}
                </div>
                <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest font-mono">
                  {feature.step}
                </span>
              </div>

              <span className="inline-block text-[10px] font-bold text-amber-300/80 uppercase tracking-wider mb-2">
                {feature.tag}
              </span>

              <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                {feature.title}
              </h3>

              <p className="text-xs text-white/45 leading-relaxed">
                {feature.description}
              </p>

              {/* Ambient Bottom Line on Hover */}
              <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
