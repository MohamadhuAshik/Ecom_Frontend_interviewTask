import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { openProductModal } from "../ui/QuickViewModal";
import { openCartDrawer, notifyCartUpdated } from "../cart/CartDrawer";
import { useAuth } from "../../context/AuthContext";
import { addToCartApi, formatImageUrl } from "../../api";

export default function ProductCard({ product, index = 0, isVisible = true }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const rawImages = Array.isArray(product.image)
    ? product.image
    : Array.isArray(product.images)
    ? product.images
    : product.image
    ? [product.image]
    : ["/images/product-headphones.jpg"];
  const images = rawImages.filter(Boolean);
  const currentImg = images[activeImgIndex] || images[0] || "/images/product-headphones.jpg";

  const discount = product.originalPrice
    ? Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    )
    : 0;

  const handleOpenQuickView = (e) => {
    if (e) e.stopPropagation();
    openProductModal(product._id || product.id);
  };

  const handleAddToCart = async (e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(true);
      const res = await addToCartApi({
        productId: product._id || product.id,
        quantity: 1,
      });
      if (res && res.success) {
        notifyCartUpdated(res);
        openCartDrawer();
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div
      className={`group relative bg-[#0f0f17]/90 backdrop-blur-md border border-white/[0.08] rounded-3xl overflow-hidden hover:border-amber-400/40 transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >

      <div
        className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#161622] to-[#0c0c12] cursor-pointer"
        onClick={handleOpenQuickView}
      >
        <img
          key={currentImg}
          src={formatImageUrl(currentImg)}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.target.src = "/images/product-headphones.jpg";
            setImgLoaded(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"
            }`}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}


        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />


        {product.badge && (
          <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-full shadow-lg z-10">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
              {product.badge}
            </span>
          </div>
        )}

        {/* Multi-image Count Badge */}
        {images.length > 1 && (
          <div className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300 flex items-center gap-1 shadow-lg z-10">
            <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{activeImgIndex + 1}/{images.length}</span>
          </div>
        )}

        {discount > 0 && images.length <= 1 && (
          <div className="absolute top-3.5 right-3.5 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 z-10">
            <span className="text-[10px] font-black text-black tracking-tight">
              -{discount}%
            </span>
          </div>
        )}

        {/* Next / Prev Image Controls for Cards with Multiple Images */}
        {images.length > 1 && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center text-xs font-bold transition-all z-20 cursor-pointer border border-white/10"
              title="Previous Photo"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImgIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center text-xs font-bold transition-all z-20 cursor-pointer border border-white/10"
              title="Next Photo"
            >
              ›
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-16 left-0 right-0 flex items-center justify-center gap-1.5 z-20">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex(i);
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setActiveImgIndex(i);
                  }}
                  className={`h-1 rounded-full transition-all cursor-pointer ${
                    activeImgIndex === i
                      ? "w-4 bg-amber-400"
                      : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`View photo ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}




        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-1.5 shadow-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:brightness-110 cursor-pointer disabled:opacity-60"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={handleOpenQuickView}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer"
            title="Quick Preview"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[11px] font-bold text-white/80">
              {product.rating}
            </span>
            <span className="text-[10px] text-white/35">
              ({product.reviews?.toLocaleString()})
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={handleOpenQuickView}
            className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition-colors duration-300 cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-xs text-white/40 line-clamp-1 mb-3">
            {product.description}
          </p>
        </div>

        {/* Price Row */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-white">
              ${product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-white/30 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="sm:hidden px-3 py-1.5 rounded-lg bg-amber-400 text-black text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {addingToCart ? "..." : "Add"}
          </button>

          <span className="hidden sm:inline text-[10px] uppercase font-semibold tracking-wider text-emerald-400">
            Free Delivery
          </span>
        </div>
      </div>
    </div>
  );
}
