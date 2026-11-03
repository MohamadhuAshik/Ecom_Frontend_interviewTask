import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addProductApi, getProductsApi, deleteProductApi, updateProductApi, formatImageUrl } from "../api";

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "audio",
    badge: "Best Seller",
    rating: "4.8",
    reviews: "120",
    description: "",
    imageUrl: "",
    inStock: true,
    featured: true,
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [colors, setColors] = useState([
    { name: "Obsidian Black", hex: "#181822" },
    { name: "Champagne Gold", hex: "#c4956a" },
  ]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#f59e0b");

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [productList, setProductList] = useState([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Edit Modal States
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editExistingImages, setEditExistingImages] = useState([]);
  const [editImageFiles, setEditImageFiles] = useState([]);
  const [editNewImagePreviews, setEditNewImagePreviews] = useState([]);
  const [editColors, setEditColors] = useState([]);
  const [editNewColorName, setEditNewColorName] = useState("");
  const [editNewColorHex, setEditNewColorHex] = useState("#f59e0b");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Load products with pagination from backend API
  const loadProducts = async (page = currentPage, limit = pageSize) => {
    try {
      setFetchingProducts(true);
      const res = await getProductsApi({ page, limit });
      if (res.success && Array.isArray(res.products)) {
        setProductList(res.products);
        setTotalProducts(res.totalProducts !== undefined ? res.totalProducts : res.products.length);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.currentPage || page);
      }
    } catch (err) {
      console.warn("Could not load products:", err.message);
    } finally {
      setFetchingProducts(false);
    }
  };

  // Confirm delete product action from dialog
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const id = productToDelete._id || productToDelete.id;
    const name = productToDelete.name;

    try {
      setDeletingId(id);
      setErrorMsg("");
      const res = await deleteProductApi(id);
      setSuccessMsg(res.message || `Product "${name}" deleted successfully!`);
      setProductToDelete(null);

      // If last item on current page was deleted, move back one page if possible
      const targetPage = productList.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      await loadProducts(targetPage, pageSize);
    } catch (err) {
      console.error("Delete product error:", err);
      setErrorMsg(err.message || "Failed to delete product from database.");
    } finally {
      setDeletingId(null);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingProduct(item);
    setEditFormData({
      name: item.name || "",
      price: item.price !== undefined ? item.price : "",
      originalPrice: item.originalPrice !== undefined ? item.originalPrice : "",
      category: item.category || "audio",
      badge: item.badge || "",
      rating: item.rating !== undefined ? item.rating : "4.8",
      reviews: item.reviews !== undefined ? item.reviews : "120",
      description: item.description || "",
      imageUrl: "",
      inStock: item.inStock !== false,
      featured: item.featured === true,
    });
    setEditExistingImages(
      Array.isArray(item.image)
        ? [...item.image]
        : typeof item.image === "string" && item.image
          ? [item.image]
          : []
    );
    setEditImageFiles([]);
    setEditNewImagePreviews([]);
    setEditColors(Array.isArray(item.colors) ? [...item.colors] : []);
    setEditError("");
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 0) {
      setEditImageFiles((prev) => [...prev, ...selected]);
      const urls = selected.map((f) => URL.createObjectURL(f));
      setEditNewImagePreviews((prev) => [...prev, ...urls]);
    }
    e.target.value = "";
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    setEditExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveNewEditImage = (indexToRemove) => {
    setEditImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setEditNewImagePreviews((prev) => {
      const url = prev[indexToRemove];
      if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleAddEditColor = () => {
    if (!editNewColorName.trim()) return;
    setEditColors((prev) => [
      ...prev,
      { name: editNewColorName.trim(), hex: editNewColorHex },
    ]);
    setEditNewColorName("");
  };

  const handleRemoveEditColor = (indexToRemove) => {
    setEditColors((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!editFormData.name || !editFormData.price || !editFormData.category || !editFormData.description) {
      setEditError("Please fill in Name, Price, Category, and Description.");
      return;
    }

    try {
      setEditLoading(true);
      const productId = editingProduct._id || editingProduct.id;

      if (editImageFiles.length > 0) {
        const payload = new FormData();
        payload.append("name", editFormData.name);
        payload.append("price", editFormData.price);
        if (editFormData.originalPrice) payload.append("originalPrice", editFormData.originalPrice);
        payload.append("category", editFormData.category);
        payload.append("badge", editFormData.badge || "");
        payload.append("rating", editFormData.rating || 0);
        payload.append("reviews", editFormData.reviews || 0);
        payload.append("description", editFormData.description);
        payload.append("inStock", editFormData.inStock);
        payload.append("featured", editFormData.featured);
        payload.append("colors", JSON.stringify(editColors));
        payload.append("existingImages", JSON.stringify(editExistingImages));

        // Append new files
        editImageFiles.forEach((f) => payload.append("image", f));

        // Append URL strings if any
        if (editFormData.imageUrl && editFormData.imageUrl.trim()) {
          const urls = editFormData.imageUrl.split(",").map((s) => s.trim()).filter(Boolean);
          urls.forEach((u) => payload.append("image", u));
        }

        await updateProductApi(productId, payload, true);
      } else {
        const manualUrls = editFormData.imageUrl
          ? editFormData.imageUrl.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        const combinedImages = [...editExistingImages, ...manualUrls];

        const payload = {
          name: editFormData.name,
          price: Number(editFormData.price),
          originalPrice: editFormData.originalPrice ? Number(editFormData.originalPrice) : 0,
          category: editFormData.category,
          badge: editFormData.badge || "",
          rating: Number(editFormData.rating || 0),
          reviews: Number(editFormData.reviews || 0),
          description: editFormData.description,
          inStock: editFormData.inStock,
          featured: editFormData.featured,
          colors: editColors,
          image: combinedImages,
        };

        await updateProductApi(productId, payload, false);
      }

      setSuccessMsg(`Product "${editFormData.name}" updated successfully!`);
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      console.error("Update product error:", err);
      setEditError(err.message || "Failed to update product.");
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
    }
  }, [isAdmin]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...selectedFiles]);
      const newUrls = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newUrls]);
    }
    e.target.value = "";
  };

  const handleRemoveFile = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImagePreviews((prev) => {
      const urlToRevoke = prev[indexToRemove];
      if (urlToRevoke && urlToRevoke.startsWith("blob:")) {
        URL.revokeObjectURL(urlToRevoke);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
    setActivePreviewIndex((prev) => (prev >= indexToRemove && prev > 0 ? prev - 1 : 0));
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColors((prev) => [
      ...prev,
      { name: newColorName.trim(), hex: newColorHex },
    ]);
    setNewColorName("");
  };

  const handleRemoveColor = (indexToRemove) => {
    setColors((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.name || !formData.price || !formData.category || !formData.description) {
      setErrorMsg("Please fill in Name, Price, Category, and Description.");
      return;
    }

    try {
      setSubmitting(true);

      // If files are selected, use FormData to leverage multer middleware
      if (imageFiles.length > 0) {
        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("price", formData.price);
        if (formData.originalPrice) payload.append("originalPrice", formData.originalPrice);
        payload.append("category", formData.category);
        payload.append("badge", formData.badge);
        payload.append("rating", formData.rating);
        payload.append("reviews", formData.reviews);
        payload.append("description", formData.description);
        payload.append("inStock", formData.inStock);
        payload.append("featured", formData.featured);
        payload.append("colors", JSON.stringify(colors));

        // Append multiple files under the "image" field
        imageFiles.forEach((file) => {
          payload.append("image", file);
        });

        // Also if manual URL(s) were typed, append them
        if (formData.imageUrl.trim()) {
          const urls = formData.imageUrl.split(",").map((s) => s.trim()).filter(Boolean);
          urls.forEach((u) => payload.append("image", u));
        }

        await addProductApi(payload, true);
      } else {
        // Send JSON with optional imageUrl(s)
        const urls = formData.imageUrl
          ? formData.imageUrl.split(",").map((s) => s.trim()).filter(Boolean)
          : [];

        const payload = {
          name: formData.name,
          price: Number(formData.price),
          originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
          category: formData.category,
          badge: formData.badge,
          rating: Number(formData.rating || 0),
          reviews: Number(formData.reviews || 0),
          description: formData.description,
          inStock: formData.inStock,
          featured: formData.featured,
          colors: colors,
          image: urls,
        };

        await addProductApi(payload, false);
      }

      setSuccessMsg(`Product "${formData.name}" added successfully!`);
      // Reset form
      setFormData({
        name: "",
        price: "",
        originalPrice: "",
        category: "audio",
        badge: "Best Seller",
        rating: "4.8",
        reviews: "120",
        description: "",
        imageUrl: "",
        inStock: true,
        featured: true,
      });
      setImageFiles([]);
      setImagePreviews([]);
      setActivePreviewIndex(0);
      // Reload products table
      loadProducts();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to add product. Please verify server status.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Admin access guard
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#11111b] border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-white mb-2">Admin Access Required</h2>
          <p className="text-xs text-white/50 mb-6">
            You must be logged in with an administrator account to access this panel.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/login"
              className="px-5 py-2.5 bg-amber-400 text-black text-xs font-bold rounded-xl hover:brightness-110"
            >
              Sign In as Admin
            </Link>
            <Link
              to="/"
              className="px-5 py-2.5 bg-white/10 text-white text-xs font-bold rounded-xl hover:bg-white/15"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080d] text-white pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col mt-2 sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-md bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Product Management
            </h1>
            <p className="text-xs text-white/50 mt-0.5">
              Logged in as <span className="text-amber-400 font-semibold">{user?.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
            >
              View Store Front
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-white/40 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg("")} className="text-white/40 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Main Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column (2 spans on desktop) */}
          <div className="lg:col-span-2">
            <div className="bg-[#11111b] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h2 className="text-lg font-black text-white mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Add New Product
              </h2>
              <p className="text-xs text-white/50 mb-6">
                Fill in the details below to publish a product directly to the backend database.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">
                    Product Title <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Noir Pro Wireless Headphones"
                    required
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60"
                  />
                </div>

                {/* Price, Original Price, Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">
                      Price ($) <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="299.99"
                      required
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">
                      Original Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      placeholder="399.99"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">
                      Category <span className="text-amber-400">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400/60"
                    >
                      <option value="audio">Audio</option>
                      <option value="wearables">Wearables</option>
                      <option value="footwear">Footwear</option>
                      <option value="accessories">Accessories</option>
                      <option value="lifestyle">Lifestyle</option>
                    </select>
                  </div>
                </div>

                {/* Badge, Rating, Reviews */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">
                      Badge
                    </label>
                    <input
                      type="text"
                      name="badge"
                      value={formData.badge}
                      onChange={handleChange}
                      placeholder="e.g. Best Seller"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">
                      Rating (0-5)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      placeholder="4.8"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">
                      Reviews Count
                    </label>
                    <input
                      type="number"
                      name="reviews"
                      value={formData.reviews}
                      onChange={handleChange}
                      placeholder="120"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">
                    Description <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide a detailed description of the product features, build, and specifications..."
                    required
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60"
                  />
                </div>

                {/* Image Upload / URL */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white/80">
                      Product Images (Multiple File Upload or Image URLs)
                    </div>
                    {imageFiles.length > 0 && (
                      <span className="text-[11px] font-bold text-amber-400">
                        {imageFiles.length} image{imageFiles.length > 1 ? "s" : ""} selected
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Multiple file upload via multer */}
                    <div>
                      <label className="block text-[11px] text-white/60 mb-1 font-medium">
                        Upload Image Files (Multer — Select One or Multiple)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="w-full text-xs text-white/60 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-black hover:file:brightness-110 cursor-pointer"
                      />
                    </div>

                    {/* Previews grid of uploaded images */}
                    {imagePreviews.length > 0 && (
                      <div>
                        <span className="block text-[11px] text-white/50 mb-2">
                          Selected Images Preview ({imagePreviews.length}):
                        </span>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {imagePreviews.map((previewUrl, idx) => (
                            <div
                              key={idx}
                              className={`relative aspect-square rounded-xl overflow-hidden border group bg-black/40 cursor-pointer ${activePreviewIndex === idx
                                ? "border-amber-400 ring-2 ring-amber-400/50"
                                : "border-white/10"
                                }`}
                              onClick={() => setActivePreviewIndex(idx)}
                            >
                              <img
                                src={previewUrl}
                                alt={`upload-${idx}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(idx);
                                }}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-[10px] font-black cursor-pointer shadow-md"
                                title="Remove this image"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Or image URL */}
                    <div>
                      <label className="block text-[11px] text-white/60 mb-1 font-medium">
                        Or Image URL (or comma-separated URLs)
                      </label>
                      <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="/images/product-headphones.jpg, /images/product-speaker.jpg"
                        className="w-full bg-[#181824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Variants */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-xs font-bold text-white/80 mb-2">
                    Color Variants
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {colors.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs"
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="ml-1 text-white/40 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="Color name (e.g. Silver)"
                      className="bg-[#181824] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none"
                    />
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer"
                    >
                      + Add Color
                    </button>
                  </div>
                </div>

                {/* Checkboxes: inStock & featured */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white/80">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleChange}
                      className="w-4 h-4 accent-amber-400 rounded"
                    />
                    In Stock
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white/80">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="w-4 h-4 accent-amber-400 rounded"
                    />
                    Featured on Homepage
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black font-black text-sm rounded-xl shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <span>Add Product to Store</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Preview Column (1 span on desktop) */}
          <div className="space-y-6">
            <div className="bg-[#11111b] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-sm font-black text-white mb-4">Live Product Preview</h3>

              <div className="bg-[#0f0f17] border border-white/10 rounded-2xl overflow-hidden p-4">
                <div className="aspect-square bg-black/40 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                  {imagePreviews.length > 0 ? (
                    <img
                      src={imagePreviews[activePreviewIndex] || imagePreviews[0]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : formData.imageUrl ? (
                    <img
                      src={formData.imageUrl.split(",")[0]?.trim()}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-xs text-white/30">No Image Uploaded</span>
                  )}
                  {imagePreviews.length > 1 && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-white/10">
                      {activePreviewIndex + 1} / {imagePreviews.length}
                    </span>
                  )}
                </div>

                {/* Thumbnails row in live preview */}
                {imagePreviews.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                    {imagePreviews.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePreviewIndex(idx)}
                        className={`w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border transition-all cursor-pointer ${activePreviewIndex === idx
                          ? "border-amber-400 ring-1 ring-amber-400 scale-105"
                          : "border-white/10 opacity-60 hover:opacity-100"
                          }`}
                      >
                        <img src={url} alt={`preview-thumb-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400">
                    {formData.category}
                  </span>
                  {formData.badge && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-black">
                      {formData.badge}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white truncate">
                  {formData.name || "Product Title Here"}
                </h4>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-base font-black text-white">
                    ${formData.price || "0.00"}
                  </span>
                  {formData.originalPrice && (
                    <span className="text-xs text-white/40 line-through">
                      ${formData.originalPrice}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-white/40 line-clamp-2 mt-2">
                  {formData.description || "Product description will appear here..."}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#11111b] border border-white/10 rounded-3xl p-6">
              <h3 className="text-sm font-black text-white mb-3">Database Stats</h3>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                <span className="text-xs text-white/60">Total Products in DB:</span>
                <span className="text-sm font-black text-amber-400">{totalProducts || productList.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Products List Table */}
        <div className="mt-12 bg-[#11111b] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-white">Products in Database</h2>
              <p className="text-xs text-white/50">
                Live products retrieved directly from MongoDB
              </p>
            </div>
            <button
              onClick={() => loadProducts(currentPage, pageSize)}
              disabled={fetchingProducts}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 cursor-pointer"
            >
              {fetchingProducts ? "Refreshing..." : "↻ Refresh List"}
            </button>
          </div>

          {productList.length === 0 ? (
            <div className="p-8 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-2xl">
              No products found in the database yet. Use the form above to add your first product!
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Badge</th>
                    <th className="py-3 px-3">Stock</th>
                    <th className="py-3 px-3">Colors</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {productList.map((item) => (
                    <tr key={item._id || item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          {/* Multi-image thumbnail strip */}
                          {(() => {
                            const raw = Array.isArray(item.image)
                              ? item.image
                              : typeof item.image === "string" && item.image
                              ? [item.image]
                              : [];
                            const imgs = raw.filter(Boolean);

                            if (imgs.length === 0) {
                              return <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0" />;
                            }

                            return (
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {imgs.slice(0, 4).map((imgUrl, idx) => (
                                  <img
                                    key={idx}
                                    src={formatImageUrl(imgUrl)}
                                    alt=""
                                    title={`Image ${idx + 1} of ${imgs.length}`}
                                    className="w-8 h-8 rounded-lg object-cover bg-black/40 border border-white/10 hover:border-amber-400 hover:scale-125 transition-transform shadow-sm cursor-pointer flex-shrink-0"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ))}
                                {imgs.length > 4 && (
                                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold text-amber-300">
                                    +{imgs.length - 4}
                                  </span>
                                )}
                              </div>
                            );
                          })()}

                          <div className="min-w-0">
                            <span className="truncate max-w-[200px] block">{item.name}</span>
                            {Array.isArray(item.image) && item.image.length > 1 && (
                              <span className="text-[10px] text-amber-400/80 font-normal">
                                📷 {item.image.length} photos
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 capitalize text-amber-400">{item.category}</td>
                      <td className="py-3 px-3 font-bold">${item.price}</td>
                      <td className="py-3 px-3">{item.badge || "-"}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.inStock
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                            }`}
                        >
                          {item.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1">
                          {item.colors && item.colors.length > 0 ? (
                            item.colors.map((c, i) => (
                              <span
                                key={i}
                                className="w-3 h-3 rounded-full border border-white/20"
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                              />
                            ))
                          ) : (
                            <span className="text-white/30">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/25 hover:border-amber-400/50 text-amber-400 hover:text-amber-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                            title={`Edit ${item.name}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductToDelete(item)}
                            disabled={deletingId === (item._id || item.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/50 text-red-400 hover:text-red-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 shadow-sm"
                            title={`Delete ${item.name}`}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Toolbar */}
            {totalProducts > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-3 border-t border-white/10">
                {/* Left side: Results Count & Page Size dropdown */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-white/50">
                  <span>
                    Showing{" "}
                    <span className="font-bold text-white">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-white">
                      {Math.min(currentPage * pageSize, totalProducts)}
                    </span>{" "}
                    of <span className="font-bold text-amber-400">{totalProducts}</span> items
                  </span>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                    <span>Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        const newLimit = Number(e.target.value);
                        setPageSize(newLimit);
                        loadProducts(1, newLimit);
                      }}
                      className="bg-[#181824] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400/50 cursor-pointer"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                    </select>
                  </div>
                </div>

                {/* Right side: Prev, Page Numbers, Next */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentPage > 1) {
                        loadProducts(currentPage - 1, pageSize);
                      }
                    }}
                    disabled={currentPage <= 1 || fetchingProducts}
                    className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <span>←</span>
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => {
                            if (pageNum !== currentPage) {
                              loadProducts(pageNum, pageSize);
                            }
                          }}
                          disabled={fetchingProducts}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-lg shadow-amber-500/20 scale-105"
                              : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentPage < totalPages) {
                        loadProducts(currentPage + 1, pageSize);
                      }
                    }}
                    disabled={currentPage >= totalPages || fetchingProducts}
                    className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <span>Next</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>

      {/* 1. Custom Delete Confirmation Dialog Modal (Replaces browser popup) */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-fade-in"
            onClick={() => !deletingId && setProductToDelete(null)}
          />

          {/* Dialog Card */}
          <div className="relative w-full max-w-md bg-[#11111b] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 animate-scale-up text-center">
            {/* Warning Icon */}
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 mx-auto mb-4 shadow-lg shadow-red-500/10">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-xl font-black text-white mb-2">Delete Product</h3>
            <p className="text-xs sm:text-sm text-white/60 mb-6 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="text-white font-bold">&ldquo;{productToDelete.name}&rdquo;</span>?
              <br />
              <span className="text-red-400/90 text-xs mt-1 block">
                This will permanently remove it from the database.
              </span>
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={confirmDeleteProduct}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Custom Edit Product Dialog Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-fade-in"
            onClick={() => !editLoading && setEditingProduct(null)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-[#11111b] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-scale-up">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => !editLoading && setEditingProduct(null)}
              className="absolute top-5 right-5 text-white/40 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="text-xl font-black text-white">Edit Product</h3>
            </div>
            <p className="text-xs text-white/50 mb-6">
              Update details for &ldquo;{editingProduct.name}&rdquo; and submit changes to backend.
            </p>

            {editError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
                <span>{editError}</span>
                <button onClick={() => setEditError("")} className="text-white/40 hover:text-white">✕</button>
              </div>
            )}

            <form onSubmit={handleUpdateProductSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  Product Title <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name || ""}
                  onChange={handleEditChange}
                  required
                  className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400/60"
                />
              </div>

              {/* Price, Original Price, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Price ($) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={editFormData.price || ""}
                    onChange={handleEditChange}
                    required
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="originalPrice"
                    value={editFormData.originalPrice || ""}
                    onChange={handleEditChange}
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Category <span className="text-amber-400">*</span>
                  </label>
                  <select
                    name="category"
                    value={editFormData.category || "audio"}
                    onChange={handleEditChange}
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400/60"
                  >
                    <option value="audio">Audio</option>
                    <option value="accessories">Accessories</option>
                    <option value="footwear">Footwear</option>
                    <option value="bags">Bags & Travel</option>
                  </select>
                </div>
              </div>

              {/* Badge, Rating, Reviews */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Badge</label>
                  <input
                    type="text"
                    name="badge"
                    value={editFormData.badge || ""}
                    onChange={handleEditChange}
                    placeholder="e.g. Best Seller"
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Rating (0-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    name="rating"
                    value={editFormData.rating || ""}
                    onChange={handleEditChange}
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Reviews Count</label>
                  <input
                    type="number"
                    name="reviews"
                    value={editFormData.reviews || ""}
                    onChange={handleEditChange}
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/60"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  Description <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={3}
                  name="description"
                  value={editFormData.description || ""}
                  onChange={handleEditChange}
                  required
                  className="w-full bg-[#181824] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400/60"
                />
              </div>

              {/* Images Management */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="text-xs font-bold text-white/80">Manage Images</div>

                {/* Existing images list */}
                {editExistingImages.length > 0 && (
                  <div>
                    <span className="block text-[11px] text-white/50 mb-1.5">Current Images ({editExistingImages.length}):</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {editExistingImages.map((imgUrl, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 group flex-shrink-0 bg-black/40">
                          <img src={formatImageUrl(imgUrl)} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(i)}
                            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-black cursor-pointer"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newly selected images */}
                {editNewImagePreviews.length > 0 && (
                  <div>
                    <span className="block text-[11px] text-amber-400/80 mb-1.5">New Images to Add:</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {editNewImagePreviews.map((url, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-amber-400/40 group flex-shrink-0 bg-black/40">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewEditImage(i)}
                            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-black cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload additional files */}
                <div>
                  <label className="block text-[11px] text-white/60 mb-1 font-medium">Upload Additional Images (Multer):</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditFilesChange}
                    className="w-full text-xs text-white/60 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-black cursor-pointer"
                  />
                </div>
              </div>

              {/* Color Variants */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs font-bold text-white/80">Colors</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editColors.map((c, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs"
                    >
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                      <span className="text-white/80">{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEditColor(idx)}
                        className="text-white/40 hover:text-red-400 ml-1 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editNewColorName}
                    onChange={(e) => setEditNewColorName(e.target.value)}
                    placeholder="Color Name (e.g. Onyx)"
                    className="flex-1 bg-[#181824] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400/60"
                  />
                  <input
                    type="color"
                    value={editNewColorHex}
                    onChange={(e) => setEditNewColorHex(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditColor}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={editFormData.inStock !== false}
                    onChange={handleEditChange}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                  In Stock
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={editFormData.featured === true}
                    onChange={handleEditChange}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                  Featured on Homepage
                </label>
              </div>

              {/* Submit & Cancel Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={editLoading}
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

