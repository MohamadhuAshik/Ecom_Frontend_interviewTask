import { useScrollReveal } from "../../hooks/useScrollReveal";

const collections = [
  {
    id: "audio",
    title: "Audio Essentials",
    subtitle: "Acoustic Perfection",
    tagline: "Custom 40mm titanium drivers & ANC technology",
    description: "Studio-grade headphones and high-fidelity speakers designed for the discerning listener.",
    image: "/images/product-headphones.jpg",
    count: "12 Curated Items",
    badge: "Trending",
  },
  {
    id: "accessories",
    title: "Heritage Goods",
    subtitle: "Artisanal Craftsmanship",
    tagline: "Swiss automatic movements & full-grain leather",
    description: "Timepieces and leathercraft built with heirloom-level attention to detail.",
    image: "/images/product-watch.jpg",
    count: "18 Exclusive Pieces",
    badge: "Flagship",
  },
  {
    id: "footwear",
    title: "Urban Motion",
    subtitle: "Contemporary Street",
    tagline: "Cloud-cushion comfort meets tailored silhouettes",
    description: "Engineered footwear designed to withstand the fast-paced rhythm of city life.",
    image: "/images/product-sneakers.jpg",
    count: "15 Modern Styles",
    badge: "New Release",
  },
];

export default function CollectionShowcase() {
  const [ref, isVisible] = useScrollReveal(0.1);

  return (
    <section
      ref={ref}
      id="collections"
      className="relative py-20 sm:py-28 bg-[#07070c] overflow-hidden w-full max-w-full"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden w-full max-w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-amber-500/[0.02] rounded-full blur-[180px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-block px-4 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full text-xs font-semibold text-amber-300 uppercase tracking-widest mb-4">
            Curated Worlds
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Shop by{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Collection
            </span>
          </h2>
          <p className="text-white/45 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Every collection is themed around a specific lifestyle, bringing
            together unified design language and unparalleled performance.
          </p>
        </div>

        {/* Collection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {collections.map((col, index) => (
            <div
              key={col.title}
              className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10 border border-white/10 hover:border-amber-400/30 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              {/* Media Container */}
              <div className="relative aspect-[4/5] overflow-hidden bg-[#101018]">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a10] via-[#0a0a10]/60 to-transparent" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors duration-500" />

                {/* Badge (Top-left) */}
                <div className="absolute top-5 left-5 px-3 py-1 bg-black/70 backdrop-blur-md border border-white/15 rounded-full z-10">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    {col.badge}
                  </span>
                </div>

                {/* Count (Top-right) */}
                <div className="absolute top-5 right-5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full z-10">
                  <span className="text-[11px] font-medium text-white/70">
                    {col.count}
                  </span>
                </div>

                {/* Bottom Content Area */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                    {col.subtitle}
                  </span>

                  <h3 className="text-2xl font-black text-white mb-2 group-hover:text-amber-300 transition-colors">
                    {col.title}
                  </h3>

                  <p className="text-xs text-white/50 leading-relaxed mb-6 max-w-sm line-clamp-2">
                    {col.description}
                  </p>

                  <a
                    href="#shop"
                    className="inline-flex items-center justify-between w-full p-3.5 rounded-2xl bg-white/[0.06] hover:bg-amber-400 hover:text-black text-white text-xs font-bold transition-all duration-300 backdrop-blur-md border border-white/10 group-hover:border-amber-400/40"
                  >
                    <span>View Collection</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
