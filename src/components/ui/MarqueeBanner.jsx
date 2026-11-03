export default function MarqueeBanner() {
  const items = [
    "✦ Free Shipping Over $150",
    "✦ Authentic Products Only",
    "✦ 30-Day Free Returns",
    "✦ Premium Quality Guaranteed",
    "✦ 24/7 Customer Support",
    "✦ Handpicked Collections",
    "✦ Secure Checkout",
    "✦ Carbon Neutral Shipping",
  ];

  return (
    <div className="relative bg-gradient-to-r from-amber-500/5 via-[#0a0a0f] to-amber-500/5 border-y border-white/[0.03] py-4 overflow-hidden w-full max-w-full">
      <div className="flex animate-marquee">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="flex-shrink-0 mx-8 text-sm font-medium text-white/20 whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
