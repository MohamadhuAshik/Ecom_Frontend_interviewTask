import apiClient from "./apiClient";

export async function getCartApi() {
  return apiClient("/cart");
}


export async function addToCartApi({ productId, quantity = 1, color = null }) {
  return apiClient("/cart/add", {
    method: "POST",
    body: { productId, quantity, color },
  });
}


export async function updateCartQuantityApi({ productId, quantity }) {
  return apiClient("/cart/update", {
    method: "PUT",
    body: { productId, quantity },
  });
}


export async function removeFromCartApi(productId) {
  return apiClient(`/cart/remove/${productId}`, {
    method: "DELETE",
  });
}


export async function clearCartApi() {
  return apiClient("/cart/clear", {
    method: "DELETE",
  });
}
