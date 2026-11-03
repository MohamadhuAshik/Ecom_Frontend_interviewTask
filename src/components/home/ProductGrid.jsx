import { useState, useEffect, useCallback } from "react";
import ProductCard from "../products/ProductCard";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { getProductsApi } from "../../api";

const initialCategories = [
  { id: "all", name: "All Products", icon: "✦" },
  { id: "audio", name: "Audio", icon: "🎧" },
  { id: "accessories", name: "Accessories", icon: "⌚" },
  { id: "footwear", name: "Footwear", icon: "👟" },
  { id: "bags", name: "Bags & Travel", icon: "🎒" },
];

export default function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [ref, isVisible] = useScrollReveal(0.05);

  const [products, setProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Fetch total counts across all categories from backend API
  const fetchCategoryCounts = useCallback(async () => {
    try {
      const res = await getProductsApi();
      if (res.success && Array.isArray(res.products)) {
        const counts = {};
        res.products.forEach((p) => {
          const cat = p.category?.toLowerCase() || "other";
          counts[cat] = (counts[cat] || 0) + 1;
        });
        setCategoryCounts(counts);
        setTotalCount(res.products.length);
      }
    } catch (err) {
      console.warn("Could not load category counts from API:", err.message);
    }
  }, []);

  // 2. Fetch products from Backend API with category & sort filters
  const fetchProducts = useCallback(async (cat, sort) => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (cat && cat !== "all") {
        params.category = cat;
      }
      if (sort) {
        params.sort = sort;
      }

      // Pure Backend API Call with filter parameters: /api/v1/products/get?category=...&sort=...
      const res = await getProductsApi(params);

      if (res.success && Array.isArray(res.products)) {
        const normalized = res.products.map((p) => {
          const rawImages = Array.isArray(p.image)
            ? p.image.filter(Boolean)
            : typeof p.image === "string" && p.image
            ? [p.image]
            : [];
          const imageList = rawImages.length > 0 ? rawImages : ["/images/product-headphones.jpg"];
          return {
            ...p,
            id: p._id || p.id,
            image: imageList,
            images: imageList,
          };
        });
        setProducts(normalized);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("API error fetching products:", err);
      setError(err.message || "Failed to load products from server");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCategoryCounts();
  }, [fetchCategoryCounts]);

  // Refetch from backend API whenever category or sort changes
  useEffect(() => {
    fetchProducts(activeCategory, sortBy);
  }, [activeCategory, sortBy, fetchProducts]);

  return (
    <section
      id="shop"
      ref={ref}
      className="relative py-20 sm:py-24 bg-[#09090e] overflow-hidden w-full max-w-full"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden w-full max-w-full">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/[0.03] rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-orange-600/[0.02] rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full text-xs font-semibold text-amber-300 uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live ({products.length})</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Our Handpicked{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Collection
            </span>
          </h2>

        </div>

        {/* Filter and Sort Toolbar */}
        <div
          className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 sm:mb-10 pb-6 border-b border-white/5 transition-all duration-700 delay-150 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
        >
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:pb-0 sm:flex-wrap sm:justify-start w-full max-w-full">
            {initialCategories.map((cat) => {
              const count = cat.id === "all" ? totalCount : categoryCounts[cat.id] || 0;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  id={`category-filter-${cat.id}`}
                  onClick={() => {
                    if (activeCategory !== cat.id) {
                      setActiveCategory(cat.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex-shrink-0 cursor-pointer ${isActive
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-lg shadow-amber-500/20 scale-[1.02]"
                    : "bg-[#14141e] border border-white/10 text-white/60 hover:text-white hover:border-amber-400/30 hover:bg-[#1a1a28]"
                    }`}
                >
                  <span>{cat.icon}</span>
                  <span className="whitespace-nowrap">{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-black/30 text-black" : "bg-white/10 text-white/40"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort Selection */}
          <div className="flex items-center justify-end gap-2.5 flex-shrink-0">
            <span className="text-xs text-white/40 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#14141e] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white/80 focus:outline-none focus:border-amber-400/50 cursor-pointer"
            >
              <option value="featured">Featured Picks</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Error Banner with Retry */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center mb-8 flex items-center justify-center gap-3">
            <span>Server Error: {error}</span>
            <button
              onClick={() => fetchProducts(activeCategory, sortBy)}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-white font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Relative Container for Product Grid & Proper Filter Loader */}
        <div className="relative min-h-[350px]">
          {/* Centered Floating Loader when filtering */}
          {loading && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#09090e]/60 backdrop-blur-[2px] rounded-3xl transition-all duration-300">
              <div className="bg-[#13131e] border border-amber-400/30 px-6 py-4 rounded-2xl shadow-2xl shadow-black/80 flex items-center gap-3.5">
                <div className="w-5 h-5 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Loading {activeCategory === "all" ? "Products" : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}...
                </span>
              </div>
            </div>
          )}

          {/* Initial Skeletons when products list is empty */}
          {loading && products.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="bg-[#0f0f17] border border-white/5 rounded-3xl p-5 animate-pulse space-y-4"
                >
                  <div className="aspect-square bg-white/5 rounded-2xl" />
                  <div className="h-4 bg-white/10 rounded-md w-3/4" />
                  <div className="h-3 bg-white/5 rounded-md w-1/2" />
                  <div className="h-6 bg-white/10 rounded-md w-1/3" />
                </div>
              ))}
            </div>
          )}

          {/* Product Grid from API */}
          {products.length > 0 && (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300 ${loading ? "opacity-25" : "opacity-100"
                }`}
            >
              {products.map((product, index) => (
                <ProductCard
                  key={product.id || product._id || index}
                  product={product}
                  index={index}
                  isVisible={true}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && products.length === 0 && !error && (
            <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-white/5 my-8">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-white/50 text-sm font-medium">
                No products found for category &ldquo;{activeCategory}&rdquo;.
              </p>
              <button
                onClick={() => setActiveCategory("all")}
                className="mt-4 px-5 py-2 bg-amber-400/10 text-amber-300 border border-amber-400/20 rounded-xl text-xs font-semibold hover:bg-amber-400/20 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
