import apiClient from "./apiClient";


const STATIC_DEMO_IMAGES = new Set([
  "product-headphones.jpg",
  "product-watch.jpg",
  "product-sneakers.jpg",
  "product-bag.jpg",
  "product-sunglasses.jpg",
  "product-speaker.jpg",
  "product-wallet.jpg",
  "product-backpack.jpg",
  "luxury-hero.jpg",
  "hero-banner.jpg",
]);

export function formatImageUrl(img) {
  if (!img) return "/images/product-headphones.jpg";
  if (
    img.startsWith("http://") ||
    img.startsWith("https://") ||
    img.startsWith("data:") ||
    img.startsWith("blob:")
  ) {
    return img;
  }

  const cleanPath = img.startsWith("/") ? img : `/${img}`;
  const fileName = cleanPath.split("/").pop();

  // If it's one of the 8 static demo images bundled with the frontend
  if (STATIC_DEMO_IMAGES.has(fileName)) {
    return `/images/${fileName}`;
  }

  // Any other uploaded image (whether in /images/ or /uploads/) is served by the backend host
  const host = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"
  ).replace(/\/api\/v1\/?$/, "");

  return `${host}${cleanPath}`;
}


export async function getProductsApi(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `/products/get?${query}` : "/products/get";
  return await apiClient(endpoint, { method: "GET" });
}

export async function getProductByIdApi(id) {
  return await apiClient(`/products/${id}`, { method: "GET" });
}

export async function deleteProductApi(id) {
  return await apiClient(`/products/delete/${id}`, {
    method: "DELETE",
  });
}


export async function updateProductApi(id, productData, isFormData = false) {
  if (isFormData) {
    const BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}/products/update/${id}`, {
      method: "PUT",
      headers,
      body: productData,
    });
    
    let data;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => ({}));
    } else {
      const text = await response.text().catch(() => "");
      data = { message: text || `Server error (${response.status})` };
    }

    if (!response.ok) {
      throw new Error(data.message || `Failed to update product (${response.status})`);
    }
    return data;
  }

  return await apiClient(`/products/update/${id}`, {
    method: "PUT",
    body: productData,
  });
}


export async function addProductApi(productData, isFormData = false) {
  if (isFormData) {
    const BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}/products/add`, {
      method: "POST",
      headers,
      body: productData, // FormData object
    });

    let data;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => ({}));
    } else {
      const text = await response.text().catch(() => "");
      data = { message: text || `Server error (${response.status})` };
    }

    if (!response.ok) {
      throw new Error(data.message || `Failed to create product (${response.status})`);
    }
    return data;
  }

  return await apiClient("/products/add", {
    method: "POST",
    body: productData,
  });
}
