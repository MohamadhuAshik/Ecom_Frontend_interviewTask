export default function Footer() {
  const footerLinks = {
    Shop: ["New Arrivals", "Best Sellers", "Sale", "Collections", "Gift Cards"],
    Help: [
      "Customer Service",
      "Track Order",
      "Returns & Exchanges",
      "Shipping Info",
      "FAQ",
    ],
    Company: ["About Us", "Careers", "Press", "Sustainability", "Investors"],
    Legal: [
      "Privacy Policy",
      "Terms of Service",
      "Cookie Policy",
      "Accessibility",
    ],
  };

  return (
    <footer
      id="footer"
      className="relative bg-[#060609] border-t border-white/5 overflow-hidden w-full max-w-full"
    >
     
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10">
     
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <a href="#home" className="flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Slip<span className="text-amber-400">Cart</span>
              </span>
            </a>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              Curated premium products for those who appreciate the finer
              things. Every item handpicked for quality.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {["twitter", "instagram", "youtube", "github"].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    id={`footer-social-${social}`}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/20 transition-all duration-300"
                  >
                    <span className="text-xs font-medium uppercase">
                      {social[0]}
                    </span>
                  </a>
                )
              )}
            </div>
          </div>

       
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/35 hover:text-amber-400 transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

     
               
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">
            © 2024 SlipCart. All rights reserved. Crafted with passion.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/20">
              {["💳", "🏦", "📱", "🔒"].map((icon, i) => (
                <span key={i} className="text-base opacity-50">
                  {icon}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
