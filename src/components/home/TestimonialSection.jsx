import { useState } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Creative Director",
    avatar: "SM",
    content:
      "SlipCart has completely changed how I shop online. The quality of every product I've received has been outstanding. It's like having a personal stylist.",
    rating: 5,
  },
  {
    id: 2,
    name: "James Rodriguez",
    role: "Tech Entrepreneur",
    avatar: "JR",
    content:
      "The Noir Pro Headphones are incredible — best audio purchase I've ever made. Fast shipping and the packaging feels like unwrapping a gift.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Chen",
    role: "Fashion Blogger",
    avatar: "EC",
    content:
      "I'm obsessed with the Heritage Crossbody. The leather quality is unmatched for this price point. Already planning my next SlipCart order!",
    rating: 5,
  },
];

export default function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [ref, isVisible] = useScrollReveal(0.15);

  return (
    <section
      ref={ref}
      id="about"
      className="relative py-20 sm:py-28 bg-[#09090f] overflow-hidden w-full max-w-full"
    >
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden w-full max-w-full">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/[0.02] rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-600/[0.02] rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-block px-4 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full text-xs font-semibold text-amber-300 uppercase tracking-widest mb-4">
            Customer Reviews
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Loved by{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-white/45 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Real feedback from verified buyers who value unmatched design,
            craftsmanship, and extraordinary customer care.
          </p>
        </div>

        {/* Cards Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {testimonials.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className={`group relative p-8 rounded-3xl cursor-pointer transition-all duration-500 flex flex-col justify-between ${
                activeIndex === index
                  ? "bg-gradient-to-br from-[#181826] to-[#0f0f18] border border-amber-400/40 shadow-2xl shadow-amber-500/10 scale-[1.02]"
                  : "bg-[#0e0e16]/80 border border-white/[0.06] hover:bg-[#141420] hover:border-white/15"
              }`}
            >
              <div>
                {/* Top Quote & Rating */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-amber-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Verified Buyer
                  </span>
                </div>

                {/* Content */}
                <p className="text-sm text-white/70 leading-relaxed mb-6 font-normal">
                  "{item.content}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-bold transition-transform duration-300 ${
                    activeIndex === index
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-black shadow-lg shadow-amber-500/25 scale-105"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {item.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {item.name}
                  </h4>
                  <p className="text-xs text-white/40">{item.role}</p>
                </div>
              </div>

              {/* Bottom active indicator line */}
              {activeIndex === index && (
                <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
              )}
            </div>
          ))}
        </div>

        {/* Featured In Logos */}
        <div
          className={`flex flex-wrap items-center justify-center gap-10 pt-10 border-t border-white/5 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="text-xs uppercase tracking-widest text-white/30 font-semibold">
            Featured In
          </span>
          {["Forbes", "Wired", "Vogue Men", "GQ Style", "Hypebeast"].map((brand) => (
            <span
              key={brand}
              className="text-sm font-extrabold text-white/20 uppercase tracking-[0.2em] hover:text-white/60 transition-colors duration-300"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
