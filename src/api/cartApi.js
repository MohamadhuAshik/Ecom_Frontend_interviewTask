import apiClient from "./apiClient";

/**
 * Fetch the authenticated user's cart
 */
export async function getCartApi() {
  return apiClient("/cart");
}

/**
 * Add an item to the cart
 * @param {{ productId: string, quantity?: number, color?: object }} payload
 */
export async function addToCartApi({ productId, quantity = 1, color = null }) {
  return apiClient("/cart/add", {
    method: "POST",
    body: { productId, quantity, color },
  });
}

/**
 * Update quantity of a cart item
 * @param {{ productId: string, quantity: number }} payload
 */
export async function updateCartQuantityApi({ productId, quantity }) {
  return apiClient("/cart/update", {
    method: "PUT",
    body: { productId, quantity },
  });
}

/**
 * Remove an item from the cart
 * @param {string} productId
 */
export async function removeFromCartApi(productId) {
  return apiClient(`/cart/remove/${productId}`, {
    method: "DELETE",
  });
}

/**
 * Clear all items from the cart
 */
export async function clearCartApi() {
  return apiClient("/cart/clear", {
    method: "DELETE",
  });
}
