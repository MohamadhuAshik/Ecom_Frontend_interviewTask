import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getCartApi,
  updateCartQuantityApi,
  removeFromCartApi,
  clearCartApi,
  formatImageUrl,
} from "../../api";
import { useAuth } from "../../context/AuthContext";


export function openCartDrawer() {
  window.dispatchEvent(new CustomEvent("slipcart:open-cart"));
}


export function notifyCartUpdated(cartData) {
  window.dispatchEvent(
    new CustomEvent("slipcart:cart-updated", { detail: cartData })
  );
}

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState({ items: [] });
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState(false);

  const { isAuthenticated } = useAuth();

  // Listen for open and update events
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      fetchCart();
    };

    const handleUpdate = (e) => {
      if (e.detail) {
        if (e.detail.cart) setCart(e.detail.cart);
        if (typeof e.detail.totalAmount === "number")
          setTotalAmount(e.detail.totalAmount);
        if (typeof e.detail.totalItems === "number")
          setTotalItems(e.detail.totalItems);
      } else {
        fetchCart();
      }
    };

    window.addEventListener("slipcart:open-cart", handleOpen);
    window.addEventListener("slipcart:cart-updated", handleUpdate);

    return () => {
      window.removeEventListener("slipcart:open-cart", handleOpen);
      window.removeEventListener("slipcart:cart-updated", handleUpdate);
    };
  }, [isAuthenticated]);

  // Fetch initial cart when authenticated
  const fetchCart = async () => {
    if (!localStorage.getItem("token")) {
      setCart({ items: [] });
      setTotalAmount(0);
      setTotalItems(0);
      return;
    }

    try {
      setLoading(true);
      const res = await getCartApi();
      if (res && res.success) {
        setCart(res.cart || { items: [] });
        setTotalAmount(res.totalAmount || 0);
        setTotalItems(res.totalItems || 0);
        notifyCartUpdated(res);
      }
    } catch (err) {
      console.warn("Failed to fetch cart:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sync cart on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [] });
      setTotalAmount(0);
      setTotalItems(0);
    }
  }, [isAuthenticated]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleUpdateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    try {
      setActionLoadingId(productId);
      const res = await updateCartQuantityApi({
        productId,
        quantity: newQty,
      });
      if (res && res.success) {
        setCart(res.cart);
        setTotalAmount(res.totalAmount);
        setTotalItems(res.totalItems);
        notifyCartUpdated(res);
      }
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setActionLoadingId(productId);
      const res = await removeFromCartApi(productId);
      if (res && res.success) {
        setCart(res.cart);
        setTotalAmount(res.totalAmount);
        setTotalItems(res.totalItems);
        notifyCartUpdated(res);
      }
    } catch (err) {
      console.error("Failed to remove cart item:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setClearing(true);
      const res = await clearCartApi();
      if (res && res.success) {
        setCart({ items: [] });
        setTotalAmount(0);
        setTotalItems(0);
        notifyCartUpdated(res);
      }
    } catch (err) {
      console.error("Failed to clear cart:", err);
    } finally {
      setClearing(false);
    }
  };

  const items = (cart && cart.items) ? cart.items : [];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] bg-[#0c0c14] border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-[#0f0f18]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Shopping Cart
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-bold border border-amber-400/30">
                  {totalItems}
                </span>
              </h2>
              <p className="text-[11px] text-white/40">Review and manage your items</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close cart drawer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free Shipping Announcement */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-400/15 px-5 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Complimentary Express Shipping</span>
          </div>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            FREE
          </span>
        </div>

        {/* Cart Items Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {loading && items.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-3 border-amber-400/20 border-t-amber-400 rounded-full animate-spin mb-3" />
              <p className="text-xs text-white/50">Loading your cart...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20 mb-5 shadow-inner">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white mb-2">Your cart is empty</h3>
              <p className="text-xs text-white/40 max-w-xs mb-6">
                Looks like you haven't added anything yet. Explore our curated catalog to get started.
              </p>
              <a
                href="/#shop"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            items.map((item) => {
              const prod = item.product || {};
              const itemId = prod._id || item._id;
              const isItemBusy = actionLoadingId === itemId;
              const unitPrice = typeof prod.price === "number" ? prod.price : item.price;
              const itemTotal = (unitPrice * item.quantity).toFixed(2);
              const imgUrl = formatImageUrl(
                Array.isArray(prod.image) ? prod.image[0] : prod.image
              );

              return (
                <div
                  key={item._id || itemId}
                  className={`relative p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-400/30 transition-all flex gap-3.5 items-center ${isItemBusy ? "opacity-60 pointer-events-none" : ""
                    }`}
                >
                  {/* Product Image */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-black/50 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    <img
                      src={imgUrl}
                      alt={prod.name || "Product"}
                      onError={(e) => {
                        e.target.src = "/images/product-headphones.jpg";
                      }}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate hover:text-amber-300 transition-colors">
                        {prod.name || "Product"}
                      </h4>
                      <button
                        onClick={() => handleRemoveItem(itemId)}
                        className="text-white/40 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Category or Color */}
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/40">
                      {prod.category && <span className="capitalize">{prod.category}</span>}
                      {item.color && item.color.name && (
                        <span className="flex items-center gap-1">
                          • {item.color.name}
                        </span>
                      )}
                    </div>

                    {/* Price and Quantity Controls */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                      <div className="text-xs font-black text-amber-300">
                        ${itemTotal}
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-white/40 font-normal ml-1">
                            (${unitPrice}/ea)
                          </span>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2 py-1">
                        <button
                          onClick={() => handleUpdateQuantity(itemId, item.quantity, -1)}
                          disabled={isItemBusy}
                          className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-white px-2 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(itemId, item.quantity, 1)}
                          disabled={isItemBusy}
                          className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-white/10 bg-[#0f0f18]/95 backdrop-blur-md space-y-4">
            {/* Subtotals */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-white/60">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-bold text-white">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <span>Shipping</span>
                <span className="font-bold text-emerald-400">FREE</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-sm">
                <span className="font-bold text-white">Estimated Total</span>
                <span className="text-lg font-black text-amber-400">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Feature Not Implemented Notice */}
            {checkoutNotice && (
              <div className="p-3 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-400/30 rounded-xl flex items-center justify-between gap-2.5 text-xs text-amber-200 animate-slide-down shadow-lg shadow-black/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-black flex-shrink-0">
                    !
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs">Feature Not Implemented</div>
                    <div className="text-[11px] text-white/60 truncate">Checkout is currently disabled.</div>
                  </div>
                </div>
                <button
                  onClick={() => setCheckoutNotice(false)}
                  className="text-white/40 hover:text-white text-xs px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                  aria-label="Dismiss notice"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setCheckoutNotice(true);
                  setTimeout(() => setCheckoutNotice(false), 4000);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black font-black text-xs sm:text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleClearCart}
                  disabled={clearing}
                  className="text-[11px] text-white/40 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {clearing ? "Clearing..." : "Clear all items"}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[11px] text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  Continue Shopping &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
