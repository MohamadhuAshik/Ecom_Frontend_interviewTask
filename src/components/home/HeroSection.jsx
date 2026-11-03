import { useState, useEffect } from "react";

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { value: "50K+", label: "Happy Customers" },
    { value: "4.9★", label: "Average Rating" },
    { value: "200+", label: "Curated Items" },
  ];

  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#08080d]"
    >
      {/* Background Ambience — Clean luxury lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden w-full max-w-full">
        {/* Subtle radial grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Ambient luminous spotlights */}
        <div className="absolute top-1/4 right-1/6 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/15 via-orange-600/10 to-transparent rounded-full blur-[140px] animate-pulse-slow" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[130px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-10 left-1/3 w-[300px] h-[300px] bg-indigo-900/15 rounded-full blur-[100px]" />

        {/* Floating stardust light particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-amber-400/40 rounded-full animate-float"
            style={{
              left: `${12 + i * 14}%`,
              top: `${18 + (i % 3) * 22}%`,
              animationDelay: `${i * 0.9}s`,
              animationDuration: `${6 + (i % 3) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Hero Text Content */}
          <div className="lg:col-span-7 xl:col-span-6">
            {/* Pill Tag */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-8 transition-all duration-700 ease-out ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-300 tracking-wider uppercase">
                New 2026 Curated Collection
              </span>
            </div>

            {/* Display Headline */}
            <h1
              className={`text-4xl sm:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6 transition-all duration-700 delay-100 ease-out ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              Pure Luxury,
              <br />
              <span className="relative inline-block mt-1">
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Effortless
                </span>
                {/* Decorative golden accent line */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-amber-400/80 pointer-events-none"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 9C58 3 148 2 298 9"
                    stroke="url(#hero-underline)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="animate-draw-line"
                  />
                  <defs>
                    <linearGradient
                      id="hero-underline"
                      x1="0"
                      y1="0"
                      x2="300"
                      y2="0"
                    >
                      <stop stopColor="#fbbf24" />
                      <stop offset="1" stopColor="#ea580c" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br />
              Living.
            </h1>

            {/* Sub-headline */}
            <p
              className={`text-base sm:text-lg text-white/55 leading-relaxed max-w-xl mb-10 transition-all duration-700 delay-200 ease-out ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              Discover handpicked luxury essentials crafted with exceptional
              materials and timeless aesthetics. Designed for those who
              appreciate precision in every detail.
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-10 sm:mb-14 transition-all duration-700 delay-300 ease-out ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <a
                href="#shop"
                id="hero-shop-btn"
                className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 rounded-2xl text-sm font-bold text-black overflow-hidden shadow-lg shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="relative z-10">Explore Catalog</span>
                <svg
                  className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>

              <a
                href="#collections"
                id="hero-collections-btn"
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl text-sm font-semibold text-white/80 border border-white/10 hover:border-amber-400/30 hover:text-white hover:bg-white/[0.04] transition-all duration-300 cursor-pointer"
              >
                <span>View Collections</span>
                <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  ↓
                </span>
              </a>
            </div>

            {/* Key Metrics */}
            <div
              className={`grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-8 transition-all duration-700 delay-400 ease-out text-center sm:text-left ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-6">
                  {i > 0 && (
                    <div className="hidden sm:block w-px h-10 bg-white/10" />
                  )}
                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-[11px] sm:text-xs text-white/40 mt-1 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Luxury Editorial Hero Showcase */}
          <div
            className={`lg:col-span-5 xl:col-span-6 transition-all duration-700 delay-300 ease-out ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="relative max-w-lg lg:max-w-xl mx-auto w-full group">
              {/* Backlight Halo Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/25 via-orange-500/20 to-amber-400/15 rounded-[2.5rem] blur-3xl opacity-75 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              {/* Main Luxury Frame */}
              <div className="relative bg-[#11111a]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 sm:p-4 shadow-2xl hover:border-amber-400/40 transition-all duration-500 overflow-hidden">
                {/* Hero Editorial Image */}
                <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#181824] via-[#12121a] to-[#0a0a0f]">
                  <img
                    src="/images/luxury-hero.jpg"
                    alt="SlipCart Haute Couture Editorial"
                    className="w-full h-full object-cover object-top rounded-2xl transform transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient vignettes and light overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Floating Badge: Top Left */}
                  <div className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center gap-2 shadow-2xl">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-white tracking-wider uppercase">
                      SlipCart Atelier 2026
                    </span>
                  </div>

                  {/* Floating Badge: Top Right */}
                  <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-amber-400/15 backdrop-blur-xl border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Editorial
                  </div>

                  {/* Content Overlay: Bottom */}
                  <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-3">
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/15 shadow-2xl flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-amber-400 text-xs">✦</span>
                        <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">
                          Haute Elegance &amp; Design
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white truncate">
                        Curated for Modern Connoisseurs
                      </h3>
                      <p className="text-[11px] text-white/60 line-clamp-1 mt-0.5">
                        Exceptional craft, timeless tailoring, and understated luxury.
                      </p>
                    </div>

                    <a
                      href="#shop"
                      className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-xl shadow-amber-500/25 hover:scale-105 hover:brightness-110 transition-all flex-shrink-0 cursor-pointer"
                      title="Explore the catalog"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Bottom Trust Row */}
                <div className="mt-3 px-2 pt-1 flex items-center justify-between text-[11px] text-white/50">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-bold text-white">4.9 / 5.0</span>
                    <span className="text-white/40">(Verified Connoisseurs)</span>
                  </div>

                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Free Global Insured Express
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
