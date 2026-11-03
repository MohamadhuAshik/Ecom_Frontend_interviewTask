import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { openProductModal } from "../ui/QuickViewModal";
import { openCartDrawer } from "../cart/CartDrawer";
import { useAuth } from "../../context/AuthContext";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import { getProductsApi, getCartApi, formatImageUrl } from "../../api";

const navLinks = [
  { name: "Home", href: "/#home" },
  { name: "Shop", href: "/#shop" }
];

export default function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const searchInputRef = useRef(null);
  const userDropdownRef = useRef(null);

  const { isScrolled } = useScrollPosition();
  const { user, isAuthenticated, logout } = useAuth();

  // Listen to cart updates and sync initial count
  useEffect(() => {
    const handleCartUpdate = (e) => {
      if (e.detail && typeof e.detail.totalItems === "number") {
        setCartCount(e.detail.totalItems);
      }
    };

    window.addEventListener("slipcart:cart-updated", handleCartUpdate);

    if (isAuthenticated) {
      getCartApi()
        .then((res) => {
          if (res && res.success && typeof res.totalItems === "number") {
            setCartCount(res.totalItems);
          }
        })
        .catch(() => {});
    } else {
      setCartCount(0);
    }

    return () => {
      window.removeEventListener("slipcart:cart-updated", handleCartUpdate);
    };
  }, [isAuthenticated]);

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      openCartDrawer();
    }
  };

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 50);
    }
  }, [searchOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      setSearchQuery("");
    } else {
      setSearchOpen(true);
      setIsMobileMenuOpen(false);
      setUserDropdownOpen(false);
    }
  };

  const handleToggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    if (!isMobileMenuOpen) {
      setSearchOpen(false);
      setSearchQuery("");
      setUserDropdownOpen(false);
    }
  };

  const [liveProducts, setLiveProducts] = useState([]);

  useEffect(() => {
    async function loadNavProducts() {
      try {
        const res = await getProductsApi();
        if (res.success && Array.isArray(res.products)) {
          const normalized = res.products.map((p) => ({
            ...p,
            id: p._id || p.id,
            image: Array.isArray(p.image) && p.image.length > 0 ? p.image[0] : p.image,
          }));
          setLiveProducts(normalized);
        }
      } catch {
        // Ignore fallback
      }
    }
    loadNavProducts();
  }, []);

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const searchResults = searchQuery.trim()
    ? liveProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-40 w-full max-w-full transition-all duration-500 ease-out ${isScrolled
        ? "bg-[#09090f]/95 backdrop-blur-2xl shadow-2xl shadow-black/40 border-b border-white/5"
        : "bg-[#09090f]/85 backdrop-blur-md border-b border-white/[0.04]"
        }`}
    >
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 xl:px-30 w-full max-w-full">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group flex-shrink-0"
            id="nav-logo"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 transform group-hover:scale-105 transition-all duration-300">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-black"
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
            <span className="text-lg sm:text-2xl font-black tracking-tight text-white whitespace-nowrap">
              Slip<span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Cart</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/5 rounded-full px-4 lg:px-5 py-1.5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                id={`nav-${link.name.toLowerCase()}`}
                className="relative px-3.5 lg:px-4 py-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors duration-300 group"
              >
                {link.name}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-amber-400 to-orange-500 group-hover:w-2/3 transition-all duration-300 rounded-full" />
              </a>
            ))}
          </div>

          {/* Right Action Icons — Search, Cart, Account, and Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Search Trigger */}
            <button
              id="nav-search-btn"
              onClick={handleToggleSearch}
              className={`w-8.5 h-8.5 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all duration-300 cursor-pointer ${searchOpen
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/25 rotate-90"
                : "bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/10 border border-white/5 rotate-0"
                }`}
              aria-label={searchOpen ? "Close search bar" : "Open search bar"}
              title={searchOpen ? "Close search (X)" : "Open search"}
            >
              {searchOpen ? (
                <svg
                  className="w-4 h-4 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>

            {/* Cart Trigger (Placed near search icon) */}
            <button
              id="nav-cart-btn"
              onClick={handleCartClick}
              className="relative w-8.5 h-8.5 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/10 border border-white/5 transition-all duration-300 cursor-pointer"
              aria-label="Open shopping cart"
              title={isAuthenticated ? `Shopping Cart (${cartCount} items)` : "Sign in to access cart"}
            >
              <svg
                className="w-4 h-4 sm:w-4.5 sm:h-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {isAuthenticated && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 sm:w-5 sm:h-5 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] sm:text-[11px] font-black rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>


            {/* Account / User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/40 text-amber-400 hover:border-amber-400 font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer shadow-md"
                  title={user?.name || "User Profile"}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </button>

                {/* User Dropdown Card */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#12121c]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-smooth-in">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-black font-black text-base flex items-center justify-center shadow-md">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {user?.name}
                        </div>
                        <div className="text-[10px] text-white/50 truncate">
                          {user?.email}
                        </div>
                        <span
                          className={`inline-block mt-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${user?.role === "admin"
                              ? "bg-amber-400 text-black"
                              : "bg-white/10 text-white/80"
                            }`}
                        >
                          {user?.role || "user"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 space-y-2">
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full py-2 px-3 text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full py-2 px-3 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/[0.04] hover:bg-amber-400 hover:text-black text-white/80 border border-white/10 hover:border-amber-400 text-xs font-bold transition-all duration-300 cursor-pointer"
                title="Sign In"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Menu Bar Hamburger Button (Mobile) */}
            <button
              id="nav-mobile-toggle"
              onClick={handleToggleMenu}
              className={`md:hidden w-8.5 h-8.5 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border cursor-pointer transition-all duration-300 ${isMobileMenuOpen
                ? "bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-400/25"
                : "bg-white/[0.04] text-white/80 hover:text-white border-white/10"
                }`}
              aria-label="Toggle navigation menu dropdown"
              title="Menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Live Search Overlay */}
        {searchOpen && (
          <div className="relative pb-4 pt-1 animate-slide-down">
            <div className="relative">
              <input
                ref={searchInputRef}
                id="nav-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") handleCloseSearch();
                }}
                placeholder="Search products (e.g. Headphones, Watch, Sneakers)..."
                className="w-full bg-[#13131c] border border-amber-400/30 rounded-2xl px-4 sm:px-5 py-3 pr-16 text-xs sm:text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-amber-400/20 shadow-2xl transition-all"
              />
              <button
                onClick={handleCloseSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-[11px] font-bold px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                ESC
              </button>
            </div>

            {searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#12121b]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto animate-smooth-in">
                {searchResults.length > 0 ? (
                  <div className="p-2 divide-y divide-white/5">
                    {searchResults.map((product) => (
                      <div
                        key={product._id || product.id}
                        onClick={() => {
                          openProductModal(product._id || product.id);
                          handleCloseSearch();
                        }}
                        className="flex items-center gap-3 p-2.5 sm:p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
                      >
                        <img
                          src={formatImageUrl(product.image)}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = "/images/product-headphones.jpg";
                          }}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg bg-black/40 border border-white/10 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {product.name}
                          </h4>
                          <span className="text-[10px] text-white/40 capitalize">
                            {product.category}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-bold text-amber-300">
                            ${product.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-center text-xs text-white/40">
                    No products matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Mobile Dropdown Menu Bar */}
      {isMobileMenuOpen && (
        <div className="md:hidden w-full bg-[#0c0c16]/98 backdrop-blur-2xl border-t border-b border-white/10 shadow-2xl animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/[0.06] transition-all text-sm font-semibold"
              >
                <span>{link.name}</span>
                <svg
                  className="w-4 h-4 text-white/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleCartClick();
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/[0.06] transition-all text-sm font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4.5 h-4.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Shopping Cart</span>
              </div>
              {isAuthenticated && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-bold border border-amber-400/30">
                  {cartCount} items
                </span>
              )}
            </button>

            {/* Mobile Account Row */}
            <div className="pt-2 border-t border-white/10">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="p-3 bg-white/[0.04] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-400 text-black font-black text-xs flex items-center justify-center">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{user?.name}</div>
                        <div className="text-[10px] text-white/50">{user?.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-xs font-bold text-red-400 hover:text-red-300 px-2 py-1 bg-red-500/10 rounded-lg cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>

                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-black rounded-xl shadow-md"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-black rounded-xl"
                >
                  Sign In / Create Account
                </Link>
              )}
            </div>

            {/* Quick Promo Strip */}
            <div className="pt-2 pb-1 border-t border-white/5 mt-2">
              <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-center">
                <span className="text-[11px] font-bold text-amber-300">
                  ⚡ Free shipping code: SLIP26
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
