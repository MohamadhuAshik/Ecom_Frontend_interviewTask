import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProductByIdApi, addToCartApi, formatImageUrl } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { openCartDrawer, notifyCartUpdated } from "../cart/CartDrawer";


export function openProductModal(productId) {
  if (productId) {
    window.dispatchEvent(
      new CustomEvent("slipcart:open-product-details", { detail: productId })
    );
  }
}

export default function QuickViewModal() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [productId, setProductId] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [modalQty, setModalQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);


  useEffect(() => {
    const handleOpen = (e) => {
      const id = e.detail;
      if (id) {
        setProductId(id);
      }
    };

    window.addEventListener("slipcart:open-product-details", handleOpen);
    return () => {
      window.removeEventListener("slipcart:open-product-details", handleOpen);
    };
  }, []);


  useEffect(() => {
    if (!productId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setProduct(null);

    getProductByIdApi(productId)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.success && res.product) {
          setProduct(res.product);
          setSelectedColorIndex(0);
        } else {
          setError(res?.message || "Product not found");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error fetching product details by ID:", err);
        setError(err.message || "Failed to load product details from server");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);


  useEffect(() => {
    if (productId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [productId]);

  const closeModal = () => {
    setProductId(null);
    setProduct(null);
    setError(null);
    setLoading(false);
    setSelectedImageIndex(0);
    setModalQty(1);
    setAddingToCart(false);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      closeModal();
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(true);
      const res = await addToCartApi({
        productId: product._id || product.id,
        quantity: modalQty,
        color: activeColorObj,
      });
      if (res && res.success) {
        notifyCartUpdated(res);
        closeModal();
        openCartDrawer();
      }
    } catch (err) {
      console.error("Failed to add to cart from modal:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRetry = () => {
    if (productId) {
      const currentId = productId;
      setProductId(null);
      setTimeout(() => setProductId(currentId), 10);
    }
  };

  if (!productId) return null;

  const colors = product?.colors || [];
  const activeColorObj =
    colors[selectedColorIndex] && typeof colors[selectedColorIndex] === "object"
      ? colors[selectedColorIndex]
      : colors[selectedColorIndex]
        ? { name: "Default", hex: colors[selectedColorIndex] }
        : null;

  const discount =
    product?.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={closeModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#0f0f18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 my-auto animate-scale-up">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-1 right-1 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 1. Loading State */}
        {loading && (
          <div className="py-24 px-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mb-4" />
            <h3 className="text-base font-bold text-white mb-1">Loading Product Details</h3>
            <p className="text-xs text-white/50">Fetching live details from backend API...</p>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <div className="py-20 px-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-2xl mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Failed to Load Product</h3>
            <p className="text-xs sm:text-sm text-white/50 max-w-sm mb-6">{error}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRetry}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:brightness-110 cursor-pointer transition-all"
              >
                Try Again
              </button>
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15 cursor-pointer transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* 3. Success State with Product Data from API */}
        {!loading && !error && product && (() => {
          const rawModalImages = Array.isArray(product?.image)
            ? product.image
            : Array.isArray(product?.images)
            ? product.images
            : product?.image
            ? [product.image]
            : ["/images/product-headphones.jpg"];
          const modalImages = rawModalImages.filter(Boolean);
          const currentModalImg = modalImages[selectedImageIndex] || modalImages[0] || "/images/product-headphones.jpg";

          return (
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Image Column */}
              <div className="relative bg-gradient-to-br from-[#161622] to-[#0c0c12] p-6 flex flex-col items-center justify-between overflow-hidden">
                <div className="relative w-full aspect-square flex items-center justify-center">
                  <img
                    key={currentModalImg}
                    src={formatImageUrl(currentModalImg)}
                    alt={product.name}
                    className="w-full h-full object-contain max-h-[340px] drop-shadow-2xl transition-all duration-300"
                    onError={(e) => {
                      e.target.src = "/images/product-headphones.jpg";
                    }}
                  />
                  {product.badge && (
                    <span className="absolute top-2 left-2 px-3 py-1 bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                      {product.badge}
                    </span>
                  )}

                  {modalImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : modalImages.length - 1))
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-sm font-bold border border-white/10 cursor-pointer shadow-lg transition-transform active:scale-95 z-10"
                        title="Previous Photo"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIndex((prev) => (prev < modalImages.length - 1 ? prev + 1 : 0))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-sm font-bold border border-white/10 cursor-pointer shadow-lg transition-transform active:scale-95 z-10"
                        title="Next Photo"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails row for multiple photos */}
                {modalImages.length > 1 && (
                  <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 max-w-full justify-center">
                    {modalImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                          selectedImageIndex === idx
                            ? "border-amber-400 ring-2 ring-amber-400/40 scale-105"
                            : "border-white/10 opacity-60 hover:opacity-100"
                        }`}
                        title={`Photo ${idx + 1}`}
                      >
                        <img
                          src={formatImageUrl(img)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/images/product-headphones.jpg";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

            {/* Product Details Column */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                {/* Category & Rating */}
                <div className="flex items-center justify-between mb-2 ">
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-bold text-white ">
                      {product.rating || "5.0"}
                    </span>
                    <span className="text-[11px] text-white/40">
                      ({(product.reviews || 0).toLocaleString()} reviews)
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-black text-white mb-2">
                  {product.name}
                </h2>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl font-black text-white">
                    ${product.price}
                  </span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-sm text-white/40 line-through">
                        ${product.originalPrice}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-xs font-bold">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-6">
                  {product.description}
                </p>


              </div>

              {/* Stock Status & Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Availability</span>
                  <span className={product.inStock !== false ? "text-emerald-400 font-semibold flex items-center gap-1.5" : "text-red-400 font-semibold"}>
                    <span className={`w-2 h-2 rounded-full ${product.inStock !== false ? "bg-emerald-400" : "bg-red-400"}`} />
                    {product.inStock !== false ? "In Stock & Ready to Ship" : "Out of Stock"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quantity Selector */}
                  <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-2 py-1.5">
                    <button
                      onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-white px-3 min-w-[24px] text-center">
                      {modalQty}
                    </span>
                    <button
                      onClick={() => setModalQty(modalQty + 1)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.inStock === false}
                    className="flex-1 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {addingToCart ? "Adding..." : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  </div>
);
}
