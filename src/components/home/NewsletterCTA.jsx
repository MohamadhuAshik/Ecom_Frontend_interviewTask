import { useState } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [ref, isVisible] = useScrollReveal(0.2);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
    }
  };

  return (
    <section
      ref={ref}
      className="relative py-20 sm:py-28 bg-[#07070c] overflow-hidden w-full max-w-full"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
        <div
          className={`relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden transition-all duration-700 p-6 sm:p-12 lg:p-20 text-center w-full max-w-full ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-10 scale-[0.98]"
          }`}
        >
          {/* Background Gradient & Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-[#12121c] to-orange-600/10" />
          <div className="absolute inset-0 border border-white/10 rounded-[2.5rem]" />

          {/* Decorative Glowing Orbs */}
          <div className="absolute -top-24 -right-24 w-[360px] h-[360px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-[320px] h-[320px] bg-orange-600/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />

          {/* Content */}
          <div className="relative max-w-2xl mx-auto z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest">
                VIP Access & Privileges
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              Get{" "}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                15% Off
              </span>{" "}
              Your First Order
            </h2>
            <p className="text-white/45 max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-8">
              Subscribe to the SlipCart journal for private drop announcements,
              early VIP seasonal previews, and curate-only editorial discounts.
            </p>

            {/* Email form or Success message */}
            {subscribed ? (
              <div className="max-w-md mx-auto p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl animate-bounce-in">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-base mb-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Welcome to the Club!
                </div>
                <p className="text-xs text-white/60">
                  Use coupon code <span className="text-amber-300 font-bold">SLIP15</span> at checkout for 15% off.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/15 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60 focus:bg-white/10 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  id="newsletter-subscribe-btn"
                  className="px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl text-sm font-bold text-black hover:shadow-xl hover:shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Claim 15% Off
                </button>
              </form>
            )}

            <p className="text-[11px] text-white/25 mt-4">
              Zero spam. Unsubscribe anytime with a single click.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
