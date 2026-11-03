import apiClient from "./apiClient";


export function formatImageUrl(img) {
  if (!img) return "/images/product-headphones.jpg";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/uploads") || img.startsWith("uploads/")) {
    const cleanPath = img.startsWith("/") ? img : `/${img}`;
    const host = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"
    ).replace(/\/api\/v1\/?$/, "");
    return `${host}${cleanPath}`;
  }
  return img;
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
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Failed to update product");
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
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Failed to create product");
    }
    return data;
  }

  return await apiClient("/products/add", {
    method: "POST",
    body: productData,
  });
}
